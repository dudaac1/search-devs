let devs = [];

window.addEventListener('load', start);

// função principal
async function start() {
    await fetchAllDevs();
    reorderDevs();
    loadDevs(devs);
    addEventsAndFilters();
}

// buscar devs no servidor
async function fetchAllDevs() {
    const data = await fetch('http://localhost:3001/devs');
    const allDevs = await data.json();
    newDevsArray(allDevs);

    function newDevsArray(allDevs) {
        allDevs.map((dev, index) => {
            let { name, picture } = dev;
            let languages = dev.programmingLanguages.map(language => { return language.id });
            let name2 = padronizeWords(name);
            devs[index] = { name, name2, picture, languages };
        });
    }
}

function padronizeWords(word) {
    word = word.toLowerCase(); // minusculas
    word = word.split(" ").join(""); // sem espaços
    word = word.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // sem acentos
    return word;
}

function reorderDevs() {
    devs.sort((a, b) => {
        let name1 = a.name;
        let name2 = b.name;
        return name1.localeCompare(name2);
    });
}

// mostrar desenvolvedores na tela
function loadDevs(devsList) {
    const devsDiv = document.querySelector('#devs');
    devsDiv.innerHTML = "";
    devsList.forEach(dev => {
        let devDiv = document.createElement('div');

        //foto do desenvolvedor
        let devImg = document.createElement('img');
        devImg.setAttribute('src', dev.picture);
        devImg.classList.add('devImg');
        devDiv.appendChild(devImg);

        //nome do desenvolvedor
        let devName = document.createElement('h3');
        devName.textContent = dev.name;
        devName.classList.add('devsName');
        devDiv.appendChild(devName);

        dev.languages.map(language => {
            let devImgLanguage = document.createElement('img');
            switch (language) {
                case 'Java':
                    devImgLanguage.setAttribute('src', './images/java.png');
                    break;
                case 'JavaScript':
                    devImgLanguage.setAttribute('src', './images/javascript.png');
                    break;
                case 'Python':
                    devImgLanguage.setAttribute('src', './images/python.png');
                    break;
                default:
                    devImgLanguage.setAttribute('src', '#');
            };
            devImgLanguage.classList.add('languageImg');
            devDiv.appendChild(devImgLanguage);
        });
        devsDiv.appendChild(devDiv);
    });

    const totalDevsSpan = document.querySelector('#totalDevsSpan');
    totalDevsSpan.textContent = devsList.length;
}

// adiciona os EventListeners e lista os filtros
function addEventsAndFilters() {
    const searchInput = document.querySelector('#searchInput');
    searchInput.addEventListener('input', filterDevs);
    searchInput.focus();

    const javaCheckbox = document.querySelector('#javaCheckbox')
    const jsCheckbox = document.querySelector('#jsCheckbox');
    const pythonCheckbox = document.querySelector('#pythonCheckbox');
    javaCheckbox.addEventListener('change', filterDevs);
    jsCheckbox.addEventListener('change', filterDevs);
    pythonCheckbox.addEventListener('change', filterDevs);

    const andRadio = document.querySelector('#andRadio');
    const orRadio = document.querySelector('#orRadio');
    andRadio.addEventListener('change', filterDevs);
    orRadio.addEventListener('change', filterDevs);

    // função geral de filtragem para os inputs, checkboxes e radios
    function filterDevs() {
        let devsToLoad = [];
        if (searchInput.value !== '') {
            devsToLoad = filterByName();
            if (javaCheckbox.checked === true || jsCheckbox.checked === true || pythonCheckbox.checked === true) {
                let devsToLoad2 = filterByLanguage(devsToLoad);
                devsToLoad = devsToLoad2;
            }
        } else {
            if (javaCheckbox.checked === true || jsCheckbox.checked === true || pythonCheckbox.checked === true) {
                devsToLoad = filterByLanguage(devs);
            } else {
                devsToLoad = devs;
            }
        }
        loadDevs(devsToLoad);
    }

    function filterByName() {
        let nameSearch = padronizeWords(searchInput.value);
        let devsToLoad = devs.filter(dev => {
            if (dev.name2.includes(nameSearch) === true) {
                return dev;
            }
        });
        return devsToLoad;
    }

    function filterByLanguage(devsList) {
        let devsToReturn = [];
        if (andRadio.checked === false && orRadio.checked === false) {
            andRadio.checked = true;
            devsToReturn = filterByLanguageAnd(devsList);
        } else if (andRadio.checked === true) {
            devsToReturn = filterByLanguageAnd(devsList);
        } else {
            devsToReturn = filterByLanguageOr(devsList);
        }
        return devsToReturn
    }

    function checkLanguages() {
        let devsLanguage = [];
        if (javaCheckbox.checked === true) {
            devsLanguage.push("Java");
        }
        if (jsCheckbox.checked === true) {
            devsLanguage.push("JavaScript");
        }
        if (pythonCheckbox.checked === true) {
            devsLanguage.push("Python")
        }
        devsLanguage.sort((a, b) => {
            return a.localeCompare(b);
        });

        return devsLanguage;
    }

    function filterByLanguageAnd(devsList) {
        let languages = checkLanguages();
        if (languages.length !== 0) {
            languages = languages.join(', ');
            let devsToReturn = devsList.filter(dev => {
                if (dev.languages.join(', ') === languages) {
                    return dev;
                }
            });
            return devsToReturn;
        } else {
            return devsList;
        }
    }

    function filterByLanguageOr(devsList) {
        let languages = checkLanguages();
        let langSize = languages.length;
        if (langSize !== 0) {
            let devsToReturn = devsList.filter(dev => {
                for (let i = 0; i < langSize; i++) {
                    if (dev.languages.includes(languages[i]) === true) {
                        return dev;
                    }
                }
            });
            return devsToReturn;
        } else {
            return devsList;
        }
    }
}