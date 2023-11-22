document.addEventListener("DOMContentLoaded", async function () { // Esperar que o DOM seja carregado

    // Obter referências para os elementos HTML
    const searchButton = document.getElementById("searchButton");
    const searchInput = document.getElementById("searchInput");
    const resultDiv = document.getElementById("result");
    const loadingDiv = document.getElementById("loading");
    const br = document.createElement("br");

    // Adicionar evento de clique ao botão de pesquisa
    searchButton.addEventListener("click", async function () {
        const searchText = searchInput.value;
        loadingDiv.style.display = "block"; // Mostrar indicador de carregamento

        // Construir o corpo da solicitação para o Elasticsearch
        const requestBody = {
            query: {
                simple_query_string: {
                    query: searchText
                } 
            }
        };

        // Enviar solicitação para o Elasticsearch
        try {
            const response = await searchInElasticsearch(requestBody);
            displayResults(response);
        } catch (error) {
            handleError(error);
        } finally {
            loadingDiv.style.display = "none"; // Ocultar indicador de carregamento, independentemente do resultado
        }
    }); // end searchButton.addEventListener

    // Enviar solicitação para o Elasticsearch
    async function searchInElasticsearch(requestBody) {
        const elasticsearchUrl = "http://localhost:9200/buscador*/_search"; // URL do Elasticsearch
        const response = await fetch(elasticsearchUrl, {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) { // Se a resposta não for 200 OK, lançar um erro
            throw new Error(`Erro na pesquisa: ${response.statusText}`);
        }
        // Se a resposta for 200 OK, retornar o corpo da resposta
        return response.json();
    } // end searchInElasticsearch

    // Exibir resultados da pesquisa
    function displayResults(response) {
        const hits = response.hits.hits; // Obter resultados da pesquisa
        resultDiv.innerHTML = ""; // Limpar resultados anteriores

        if (hits.length > 0) { // Se algum resultado for encontrado, exibir resultados

            // Exibir resultados da pesquisa
            hits.forEach(hit => {

                const source = hit._source; // Obter documento original do Elasticsearch
                const resultItem = document.createElement("div"); // Criar elemento HTML para exibir o resultado
                resultItem.id = 'resultItem';

                // Exibir título do documento
                const titleNode = document.createTextNode(source.title);
                const titleElement = document.createElement('h2');
                titleElement.appendChild(titleNode);
                resultItem.appendChild(titleElement);

                // Exibir corpo do documento
                const bodyNode = document.createTextNode(source.body.substring(0, 200) +
                    (source.body.length > 200 ? "..." : ""));
                const bodyElement = document.createElement('p');
                bodyElement.appendChild(bodyNode);
                resultItem.appendChild(bodyElement);

                // Exibir resultado
                resultDiv.appendChild(resultItem);

                // Exibir link para o documento original
                resultItem.addEventListener("click", function (event) {
                    let resultWindow = window.open('', '_blank');
                    resultWindow.document.write('<html><head><title>' + source.title + '</title>' +
                                                '<link rel="stylesheet" href="style2.css"></head><body>' +
                                                '<div><h1>' + source.title + '</h1>' + 
                                                '<p>' + source.body + '</p>' +
                                                '<b>Score: </b>' + hit._score + '</div>' +
                                                '<div id="dataDiv"><h2>Dados </h2>' +
                                                '<b>id: </b>' + source.id + '<br><br>' +
                                                '<b>date: </b>' + source.date + '<br><br>' +
                                                '<b>court: </b>' + source.court + '<br><br>' +
                                                '<b>click_context: </b>' + source.click_context + '<br><br>' +
                                                '<b>copy_context: </b>' + source.copy_context + '<br><br>' +
                                                '<b>expanded_copy_context: </b>' + source.expanded_copy_context + '<br><br>' +
                                                '</div></body></html>');
                }); // end resultItem.addEventListener

                resultItem.addEventListener("mouseover", function (event) {
                    resultItem.style.backgroundColor = "#e0e0e0";
                }); // end resultItem.addEventListener
                resultItem.addEventListener("mouseout", function (event) {
                    resultItem.style.backgroundColor = "#f0f0f0";
                });
                
            }); // end hits.forEach

        } else { // Se nenhum resultado for encontrado, exibir mensagem
            resultDiv.textContent = "Nenhum resultado encontrado.";
        } // end if/else

    } // end displayResults

    // Exibir mensagem de erro
    function handleError(error) {
        console.error("Erro na pesquisa:", error);
        resultDiv.textContent = "Ocorreu um erro na pesquisa. Consulte o console para obter detalhes.";
    } // end handleError

}); // end document.addEventListener
