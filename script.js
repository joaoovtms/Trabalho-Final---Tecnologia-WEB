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
            listaProdutos.forEach((produto, index) => {
                if (produto.ativo) {
                    let row = productList.insertRow();
                    row.innerHTML = `
                        <td>${produto.codigoProduto}</td>
                        <td>${produto.nomeProduto}</td>
                        <td>${produto.unidade}</td>
                        <td>${produto.quantidade}</td>
                        <td>${produto.quantidadeComprada || 0}</td>
                        <td><input type="checkbox" ${produto.coletado ? "checked" : ""} data-index="${index}"></td>
                    `;
                }
            });
        }
    };

    const addProduct = (produto) => {
        listaProdutos.push(produto);
        saveToLocalStorage();
        renderProductList();
    };

    // Adiciona produtos ao localStorage
    if (productForm) {
        productForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const codigoProduto = listaProdutos.length > 0 ? Math.max(...listaProdutos.map(p => p.codigoProduto)) + 1 : 1;
            const nomeProduto = document.getElementById("nomeProduto").value;
            const unidade = document.getElementById("unidade").value;
            const quantidade = parseInt(document.getElementById("quantidade").value);
            const codigoBarra = document.getElementById("codigoBarra").value;
            const ativo = document.getElementById("ativo").checked;

            const novoProduto = { codigoProduto, nomeProduto, unidade, quantidade, codigoBarra, ativo, quantidadeComprada: 0, coletado: false };
            addProduct(novoProduto);
            productForm.reset();
        });
    }

    // Lógica para a página de lista
    if (productListElement) {
        productListElement.addEventListener("change", (event) => {
            if (event.target.type === "checkbox") {
                const index = event.target.getAttribute("data-index");
                listaProdutos[index].coletado = event.target.checked;
                saveToLocalStorage();
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
                        saveToLocalStorage();
                        renderProductList();
                    }
                });
            });
        }

        renderProductList();
    }
});
