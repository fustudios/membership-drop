const fs = require("fs");

function main(){
 
    var ssh1Address = new Array();
    var ssh1NFTs = new Array();
    var ssh2Address = new Array();
    var ssh2NFTs = new Array();
    var ssh3Address = new Array();
    var ssh3NFTs = new Array();

    var ss1 = new Object();
    var ss2 = new Object();
    var ss3 = new Object();

    function readAndAssign(callback_)
    {
        fs.readFile("ss1AddressList.txt", 'utf8', (err, data) => {
            if (err) throw err;
            ssh1Address = data.toString().split(",");

            fs.readFile("ss2AddressList.txt", 'utf8', (err, data) => {
                if (err) throw err;
                ssh2Address = data.toString().split(",");

                fs.readFile("ss3AddressList.txt", 'utf8', (err, data) => {
                    if (err) throw err;
                    ssh3Address = data.toString().split(",");
                    
                    fs.readFile("ss1NFTList.txt", 'utf8', (err, data) => {
                        if (err) throw err;
                        ssh1NFTs = data.toString().split(",");
                    
                        fs.readFile("ss2NFTList.txt", 'utf8', (err, data) => {
                            if (err) throw err;
                            ssh2NFTs = data.toString().split(",");
                        
                            fs.readFile("ss3NFTList.txt", 'utf8', (err, data) => {
                                if (err) throw err;
                                ssh3NFTs = data.toString().split(",");
                                callback_();
                            });
                        });
                    });
                });
            });
        });
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

        fs.writeFile('./ss1Final.txt', objToString(ss1), err => {
            if (err) {
              console.error(err);
            } else {
                fs.writeFile('./ss2Final.txt', objToString(ss2), err => {
                    if (err) {
                      console.error(err);
                    } else {
                        fs.writeFile('./ss3Final.txt', objToString(ss3), err => {
                            if (err) {
                              console.error(err);
                            } else {
                              // file written successfully
                            }
                          });
                    }
                  });
            }
          });
    }

    function objToString (obj) {
        let str = '';
        for (const [p, val] of Object.entries(obj)) {
            str += `${p},${val}\n`;
        }
        return str;
    }

    readAndAssign(compute);
}



main();
