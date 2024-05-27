const fs = require("fs");

const snapshots = [1, 2, 3];

function main(){
    const dataIn = snapshots.map(snapshot => readSnapshotData(snapshot));
    const dataOut = snapshots.map(_ => ({}));

    for (let [addr, amount3] of Object.entries(dataIn[2])) {
        let amount1 = dataIn[0][addr] || 0;
        let amount2 = dataIn[1][addr] || 0;

        amount1 = Math.min(amount1, amount2, amount3);
        amount2 = Math.min(amount2, amount3);
        amount2 -= amount1;
        amount3 -= (amount1 + amount2);

        if (amount1 > 0) dataOut[0][addr] = amount1;
        if (amount2 > 0) dataOut[1][addr] = amount2;
        if (amount3 > 0) dataOut[2][addr] = amount3;
    }
}

function readSnapshotData(snapshotNumber) {
    const data = fs.readFileSync(`snapshot${snapshotNumber}.txt`, 'utf8');
    let result = {};
    for (const row of data.trim().split("\n")) {
        const [address, balance] = row.split(',').map(x => x.trim());
        result[address] = balance;
    }
    return result;
}

function writeSnapshotData(snapshotNumber, data) {
    fs.writeFileSync(
        `snapshot${snapshotNumber}Out.txt`,
        Object.entries(data).map(([addr, balance]) => `${addr},${balance}`).join("\n")
    );
}

main();
