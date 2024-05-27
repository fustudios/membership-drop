const fs = require("fs");

const snapshots = [1, 2, 3];
const graphUrl = 'https://api.thegraph.com/subgraphs/name/bowsernet/open-season-staging';
const graphPageSize = 1000;
const maxPage = 10;
const multipliers = [1.2, 1.1, 1];
const numFuTokens = 62_100_000;

const getGraphQuery = (afterId = 0) => `
{
    nfts(
        first: ${graphPageSize},
        orderBy: tokenId,
        where:{ collection: "0x1c67d8f07d7ef2d637e61ed3fbc3fa9aaf7a6267", tokenId_gt: "${afterId}"}
    ) {
        tokenId
        user { id }
    }
}
`;

async function main(){
    // writeSnapshotData('snapshot3.txt', await readSnapshot3(), '');

    const balancesIn = snapshots.map(snapshot => readSnapshotData(`snapshot${snapshot}.txt`));
    const balances = recalcSnapshots(balancesIn);
    const weightedBalances = computeWeightedBalances(balances);
    const fuBalances = computeFuDrops(weightedBalances);

    snapshots.map(snapshot => writeSnapshotData(`snapshot${snapshot}Out.txt`, balances[snapshot - 1]));
    writeSnapshotData('FU.csv', fuBalances);

    console.log('FU sum', sumBalances(fuBalances));
}

function recalcSnapshots(balancesIn) {
    const result = snapshots.map(_ => ({}));

    for (let [addr, balance3] of Object.entries(balancesIn[2])) {
        let balance1 = balancesIn[0][addr] || 0;
        let balance2 = balancesIn[1][addr] || 0;

        balance1 = Math.min(balance1, balance2, balance3);
        balance2 = Math.min(balance2, balance3);
        balance2 -= balance1;
        balance3 -= (balance1 + balance2);

        if (balance1 > 0) result[0][addr] = balance1;
        if (balance2 > 0) result[1][addr] = balance2;
        if (balance3 > 0) result[2][addr] = balance3;
    }
    return result;
}

function computeWeightedBalances(balances) {
    let result = {};
    for (let i = 0; i < 3; i++) {
        for (const [addr, balance] of Object.entries(balances[i])) {
            result[addr] = (result[addr] || 0) + balance * multipliers[i];
        }
    }
    return result;
}

function computeFuDrops(weightedBalances) {
    const weightedSum = sumBalances(weightedBalances);
    const fuPerBalance = numFuTokens / weightedSum;
    const result = {};
    for (const [addr, balance] of Object.entries(weightedBalances)) {
        result[addr] = balance * fuPerBalance;
    }
    return result;
}

function sumBalances(data) {
    return Object.values(data).reduce((sum, count) => sum + parseFloat(count), 0);
}

async function readSnapshot3() {
    let result = {};
    let lastId = '0';
    let page = 0;
    do {
       const holders = await fetchHoldersAfterId(lastId);
       for (const { holder } of holders) {
          result[holder] = (result[holder] || 0) + 1;
       }
       if (holders.length === 0) break;
       page++;
       lastId = holders[holders.length - 1].tokenId;
    } while (page < maxPage);
    return result;
}

async function fetchHoldersAfterId(id) {
    const query = getGraphQuery(id);
    const response = await fetch(graphUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    const json = await response.json();
    const { data } = json;
    return data.nfts.map(item => ({ holder: item.user.id, tokenId: item.tokenId }));
}

function readSnapshotData(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    let result = {};
    for (const row of data.trim().split("\n")) {
        const [address, balance] = row.split(',').map(x => x.trim());
        result[address] = balance;
    }
    return result;
}

function writeSnapshotData(filename, data) {
    fs.writeFileSync(
        filename,
        Object.entries(data).map(([addr, balance]) => `${addr},${balance}`).join("\n")
    );
}

main().catch(e => console.error(e));
