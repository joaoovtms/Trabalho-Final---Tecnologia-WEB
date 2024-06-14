document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("productForm");
    const productListElement = document.getElementById("productList");
    const productList = productListElement ? productListElement.getElementsByTagName('tbody')[0] : null;
    const enviarServidorBtn = document.getElementById("enviarServidor");

    let listaProdutos = JSON.parse(localStorage.getItem("listaProdutos")) || [];
    let listaCompras = JSON.parse(localStorage.getItem("listaCompras")) || [];

    const saveToLocalStorage = () => {
        localStorage.setItem("listaProdutos", JSON.stringify(listaProdutos));
        localStorage.setItem("listaCompras", JSON.stringify(listaCompras));
    };

    const renderProductList = () => {
        if (productList) {
            productList.innerHTML = "";
            listaProdutos.filter(produto => produto.ativo).forEach((produto, index) => {
                const compra = listaCompras.find(item => item.codigoProduto === produto.codigoProduto);
                const quantidadeComprada = compra ? compra.quantidadeComprada : 0;
                const coletado = compra ? compra.coletado : false;

                let row = productList.insertRow();
                row.innerHTML = `
                    <td>${produto.codigoProduto}</td>
                    <td>${produto.nomeProduto}</td>
                    <td>${produto.unidade}</td>
                    <td>${produto.quantidade}</td>
                    <td><input type="number" value="${quantidadeComprada}" data-index="${index}" class="quantidadeComprada"></td>
                    <td><input type="checkbox" ${coletado ? "checked" : ""} disabled data-index="${index}"></td>
                    <td style="padding: 0;">
                        <div style="display: flex; width: 100%; height: 100%; justify-content: space-between;">
                            <button class="editar" data-index="${index}" style="flex: 1; margin: 0 5px;">Editar</button>
                            <button class="excluir" data-index="${index}" style="flex: 1; margin: 0 5px;">Excluir</button>
                        </div>
                    </td>
                `;
            });
        }
    };

    const deleteProduct = (index) => {
        const produto = listaProdutos[index];
        listaProdutos.splice(index, 1);
        listaCompras = listaCompras.filter(item => item.codigoProduto !== produto.codigoProduto);
        saveToLocalStorage();
        renderProductList();
    };

    if (productListElement) {
        productListElement.addEventListener("change", (event) => {
            const index = event.target.getAttribute("data-index");
            if (event.target.classList.contains("quantidadeComprada")) {
                const produto = listaProdutos[index];
                const quantidadeComprada = parseInt(event.target.value);

                let compra = listaCompras.find(item => item.codigoProduto === produto.codigoProduto);
                if (!compra) {
                    compra = { codigoProduto: produto.codigoProduto, quantidadeComprada: 0, coletado: false };
                    listaCompras.push(compra);
                }
                compra.quantidadeComprada = quantidadeComprada;
                compra.coletado = quantidadeComprada >= produto.quantidade;

                saveToLocalStorage();
                renderProductList();
            }
        });

        productListElement.addEventListener("click", (event) => {
            if (event.target.classList.contains("editar")) {
                const index = event.target.getAttribute("data-index");
                const produto = listaProdutos[index];
                localStorage.setItem("produtoEditado", JSON.stringify(produto));
                window.location.href = "cadastro.html";
            } else if (event.target.classList.contains("excluir")) {
                const index = event.target.getAttribute("data-index");
                deleteProduct(index);
            }
        });

        if (enviarServidorBtn) {
            enviarServidorBtn.addEventListener("click", () => {
                fetch("https://6669f4e02e964a6dfed73731.mockapi.io/compra", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(listaCompras)
                }).then(response => {
                    if (response.ok) {
                        alert("Lista enviada com sucesso!");
                        listaCompras = [];
                        localStorage.removeItem("listaCompras");
                        renderProductList();
                    }
                });
            });
        }

        renderProductList();
    }

    const preencheFormulario = () => {
        const produtoEditado = JSON.parse(localStorage.getItem("produtoEditado"));
        if (produtoEditado) {
            document.getElementById("codigoProduto").value = produtoEditado.codigoProduto;
            document.getElementById("nomeProduto").value = produtoEditado.nomeProduto;
            document.getElementById("unidade").value = produtoEditado.unidade;
            document.getElementById("quantidade").value = produtoEditado.quantidade;
            document.getElementById("codigoBarra").value = produtoEditado.codigoBarra;
            document.getElementById("ativo").checked = produtoEditado.ativo;
            localStorage.removeItem("produtoEditado");
        }
    };

    const addProduct = (produto) => {
        listaProdutos.push(produto);
        saveToLocalStorage();
    };

    const editProduct = (index, produto) => {
        listaProdutos[index] = produto;
        saveToLocalStorage();
    };

    if (productForm) {
        productForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const codigoProduto = document.getElementById("codigoProduto").value || (listaProdutos.length > 0 ? Math.max(...listaProdutos.map(p => p.codigoProduto)) + 1 : 1);
            const nomeProduto = document.getElementById("nomeProduto").value;
            const unidade = document.getElementById("unidade").value;
            const quantidade = parseInt(document.getElementById("quantidade").value);
            const codigoBarra = document.getElementById("codigoBarra").value;
            const ativo = document.getElementById("ativo").checked;

            const novoProduto = { codigoProduto, nomeProduto, unidade, quantidade, codigoBarra, ativo };

            if (document.getElementById("codigoProduto").value) {
                const index = listaProdutos.findIndex(p => p.codigoProduto == codigoProduto);
                editProduct(index, novoProduto);
            } else {
                addProduct(novoProduto);
            }
            
            saveToLocalStorage();
            productForm.reset();
            window.location.href = "lista.html";
        });

        preencheFormulario();
    }
});
