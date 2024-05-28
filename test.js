const fs = require('fs');

function testResult()
{
    for (let i = 1; i <= 3; i++) {
        const dataCorrect = fs.readFileSync(`test-data/snapshot${i}Out.correct.csv`, 'utf8').trim();
        const data = fs.readFileSync(`test-data/snapshot${i}Out.csv`, 'utf8').trim();
        compareData(`snapshot${i}Out.csv`, data, dataCorrect);
    }
}

function compareData(filename, data1, data2) {
    const data1Parsed = parseData(data1);
    const data2Parsed = parseData(data2);
    for (const [address, amount] of Object.entries(data1Parsed)) {
        const amount2 = data2Parsed[address];
        if (amount2 !== amount) {
            throw new Error(`Amount differs. File:${filename}, address: ${address}: ${amount} vs ${amount2}`)
        }
    }
}

function parseData(data) {
    const dataParsed = {};
    const lines = data.split("\n");
    for (const line of lines) {
        const [address, amount] = line.split(",");
        dataParsed[address] = parseInt(amount);
    }
    return dataParsed;
}

testResult();