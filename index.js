const fs = require("fs");

function main(){
 
    var ssh1Address = new Array();
    var ssh1NFTs = new Array();
    var ssh2Address = new Array();
    var ssh2NFTs = new Array();
    var ssh3Address = new Array();
    var ssh3NFTs = new Array();

    var ss1 = {};
    var ss2 = {};
    var ss3 = {};

    function readFileAndSplit(path) {
        const data = fs.readFileSync(path, 'utf8');
        return data.toString().split(",");
    }

    function readAndAssign() {
        try {
            ssh1Address = readFileAndSplit("ss1AddressList.txt");
            ssh2Address = readFileAndSplit("ss2AddressList.txt");
            ssh3Address = readFileAndSplit("ss3AddressList.txt");
            ssh1NFTs = readFileAndSplit("ss1NFTList.txt");
            ssh2NFTs = readFileAndSplit("ss2NFTList.txt");
            ssh3NFTs = readFileAndSplit("ss3NFTList.txt");
        } catch (err) {
            console.error(err);
        }
    }
    function compute()
    {
        for (let i in ssh3Address) 
        {
            for (let j in ssh2Address) 
            {
                if(ssh3Address[i] == ssh2Address[j])
                {
                    for (let k in ssh1Address) 
                    { 
                        if(ssh2Address[j] == ssh1Address[k])
                        {
                            ss1[ssh1Address[k]] = Math.min(ssh1NFTs[k],ssh2NFTs[j], ssh3NFTs[i]);
                        }
                    }
                    var min = Math.min(ssh2NFTs[j], ssh3NFTs[i]);
                    if(ss1[ssh2Address[j]] !== undefined) 
                    {
                        var total = min - ss1[ssh2Address[j]];
                        if(total != 0)
                        {
                            ss2[ssh2Address[j]] = total;
                        }
                    }
                }
            }
            
            var NFTcache = ssh3NFTs[i]
            
            if(ss1[ssh3Address[i]] !== undefined)
            {
                NFTcache -= ss1[ssh3Address[i]] 
            } 
            
            if(ss2[ssh3Address[i]] !== undefined)
            {
                NFTcache -= ss2[ssh3Address[i]]
            }
            
            if(NFTcache != 0)
            {
                ss3[ssh3Address[i]]  = NFTcache
            }
        }

        fs.writeFileSync('./ss1Final.txt', objToString(ss1));
        fs.writeFileSync('./ss2Final.txt', objToString(ss2));
        fs.writeFileSync('./ss3Final.txt', objToString(ss3));
    }

    function objToString (obj) {
        let str = '';
        for (const [p, val] of Object.entries(obj)) {
            str += `${p},${val}\n`;
        }
        return str;
    }

    readAndAssign();
    compute();
}



main();
