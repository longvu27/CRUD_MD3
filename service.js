const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('qs');

const server = http.createServer((req, res) => {
    let urlParse = url.parse(req.url, true);
    let pathName = urlParse.pathname;
    let arrPath = pathName.split('/');
    let trimPath = arrPath[1];

    let chosenHander;
    if (typeof router[trimPath] === 'undefined') {
        chosenHander = handler.notFound;
    } else {
        chosenHander = router[trimPath];
    }
    chosenHander(req, res, arrPath[2]);
})

let handler = {};

handler.home = (req, res) => {
    fs.readFile('./views/home.html', 'utf-8', (err, data) => {
        res.writeHead(200, 'text/html');
        res.write(data);
        res.end();
    })
}

handler.add = (req, res) => {
    if (req.method === 'GET') {
        fs.readFile('./views/add.html', 'utf-8', (err, data) => {
            res.writeHead(200, 'text/html');
            res.write(data);
            res.end();
        })
    } else {

        let data = '';
        let listProduct = []
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {

            const product = qs.parse(data);
            fs.readFile('./data/product.json', 'utf-8', (err, productJson) => {

                listProduct = JSON.parse(productJson);
                listProduct.push(product);
                listProduct = JSON.stringify(listProduct);

                fs.writeFile('./data/product.json', listProduct, err1 => {
                    console.log(err1);
                })
            })
        })
        res.writeHead(301, {'location': '/home'});
        res.end();
    }
}

handler.edit = (req, res, index) => {
    if (req.method === 'GET') {
        fs.readFile('./views/edit.html', 'utf-8', (err, data) => {
            res.writeHead(200, 'text/html');
            res.write(data);
            res.end();

        })
    } else {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            let listProduct = [];
            let product = qs.parse(data);
            fs.readFile('./data/product.json', 'utf-8', (err, productJson) => {
                listProduct = JSON.parse(productJson);
                for (let i = 0; i < listProduct.length; i++) {
                    if (i === +index) {
                        listProduct[i] = product;
                    }
                }
                // listProduct[index] = product
                listProduct = JSON.stringify(listProduct);
                fs.writeFile('./data/product.json', listProduct, err => {
                    console.log(err)
                })
            })
            res.writeHead(301, {'location': '/home'});
            res.end();
        })

    }
}

// handler.delete = (req, res, index) => {
// if(req.method === 'POST') {
//     let product =[];
//     fs.readFile('./data/product.json','utf-8',(err, productJson) => {
//         for (let i = 0; i < product.length; i++) {
//             if(i === +index) {
//                 product.splice(i,1);
//             }
//         }
//         product = JSON.stringify(product);
//         fs.writeFile('./data/product.json',product, err1 => {
//             console.log(err1)
//         });
//         res.writeHead(301, {'location': '/home'});
//         res.end();
//     })
// }

// let productDelete = [];
//
// fs.readFile('./data/product.json', 'utf-8', (err, productJson) => {
//     productDelete = JSON.parse(productJson);
//     for (let i = 0; i < productDelete.length; i++) {
//         if(i === +index) {
//             productDelete.splice(index,1);
//         }
//     }
//     productDelete = JSON.stringify(productDelete);
//     fs.writeFile('./data/product.json', productDelete, err1 => {
//         console.log(err1)
//     })
//     res.writeHead(301, {'location': '/home'});
//     res.end();
// })

handler.delete = (req, res, index) => {
    if (req.method === 'GET') {
        fs.readFile('./views/delete.html', 'utf-8', (err, data) => {
            res.writeHead(200, "text/html");
            res.write(data);
            res.end();
        });
    }
    if (req.method === 'POST') {
        let listProduct = [];
        fs.readFile('./data/product.json', 'utf-8', (err, productJson) => {
            listProduct = JSON.parse(productJson);
            for (let i = 0; i < listProduct.length; i++) {
                if (i === +index) {
                    listProduct.splice(index, 1);
                    console.log(listProduct[i])
                }
            }
            listProduct = JSON.stringify(listProduct)
            fs.writeFile('./data/product.json', listProduct, err => {
                console.log(err)
            });
            res.writeHead(301, {'location': '/home'});
            res.end();
        })
    }
}

handler.notFound = (req, res) => {
    fs.readFile('./views/notFound.html', 'utf-8', (err, data) => {
        res.writeHead(200, 'text/html');
        res.write(data);
        res.end();
    })

}

handler.show = (req, res) => {
    let showProduct = '';
    fs.readFile('./data/product.json', 'utf-8', (err, listProduct) => {
        listProduct = JSON.parse(listProduct);
        listProduct.forEach((item, index) => {
            showProduct += `${index + 1} - Tên: ${item.name}  <a href="edit/${index}">Sửa</a> - <a href="delete/${index}">Xóa</a> <br>`
        });
        fs.readFile('./views/show.html', 'utf-8', (err, indexHtml) => {
            res.writeHead(200, 'text/html');
            indexHtml = indexHtml.replace('{product}', showProduct);
            res.write(indexHtml);
            res.end();
        })
    })
}

let router = {
    'home': handler.home,
    'add': handler.add,
    'edit': handler.edit,
    'delete': handler.delete,
    'notFound': handler.notFound,
    'show': handler.show
}

server.listen(8080, () => {
    console.log('running');
})