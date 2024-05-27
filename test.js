const fs = require('fs');

function testResult()
{
    for (let i = 1; i <= 3; i++) {
        const dataSnapshot = fs.readFileSync(`ss${i}Final.snapshot.txt`, 'utf8').trim();
        const data = fs.readFileSync(`ss${i}Final.txt`, 'utf8').trim();
        compareData(`ss${i}Final.txt`, data, dataSnapshot);
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