function mostrarItinerario(numeroLinha) {
    var json = getJson();
    Linhas = json.Linhas;
    Ruas = json.Ruas;

    linhaObj = Linhas.find(linha => linha.numero == numeroLinha);

    Ida = linhaObj.ida;
    Volta = linhaObj.volta;
    IdaEVolta = [];

    indexMaior = Math.max(Ida.length, Volta.length);

    idaAcabou = false;
    voltaAcabou = false;

    for (i = 0; i <= indexMaior; i++) {
        linhaTabelaIdaVolta = [];

        if (i < Ida.length) {
            idRua = Ida[i];
            rua = Ruas.find(rua => rua.id == idRua);
            nomeRua = rua.nome;
            linhaTabelaIdaVolta.push(i + 1 + "ª  ➜ " + nomeRua);
        }
        else if (!idaAcabou) {
            linhaTabelaIdaVolta.push("Fim das ruas da ida.");
            idaAcabou = true;
        }
        else linhaTabelaIdaVolta.push(" ");

        if (i < Volta.length) {
            idRua = Volta[i];
            rua = Ruas.find(rua => rua.id == idRua);
            nomeRua = rua.nome;
            linhaTabelaIdaVolta.push(i + 1 + "ª ➜ " + nomeRua);
        }
        else if (!voltaAcabou) {
            linhaTabelaIdaVolta.push("Fim das ruas da volta.");
            voltaAcabou = true;
        }
        else linhaTabelaIdaVolta.push(" ");

        IdaEVolta.push(linhaTabelaIdaVolta);
    }

    UpdateTableItinerario(IdaEVolta, numeroLinha);
}

function UpdateTableItinerario(data, numeroLinha) {
    $("#bodyModalItinerario").html("<h6>Itinerário da linha " + numeroLinha + "</h6>" + $('#scrollTabelaItinerario').html());

    tableOptions = {
        columnDefs: [{
            targets: "_all",
            className: 'dt-body-left'
        }],
        "bSort": false,
        "bLengthChange": false,
        "bPaginate": false,
        "lengthMenu": [[6, 10, 25, 50, -1], [6, 10, 25, 50, "Todas"]],
        "pageLength": -1,
        // scrollY: '50vh',
        // scrollX: true,
        fixedHeader: true,
        "language": {
            //Strings de idioma:
            "sEmptyTable": "Nenhum registro encontrado",
            "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
            "sInfoFiltered": "(Filtrados de _MAX_ registros)",
            "sInfoPostFix": "",
            "sInfoThousands": ".",
            "sLengthMenu": "_MENU_ resultados por página",
            "sLoadingRecords": "Carregando...",
            "sProcessing": "Processando...",
            "sZeroRecords": "Nenhum registro encontrado",
            "sSearch": "Pesquisar",
            "oPaginate": {
                "sNext": "Próximo",
                "sPrevious": "Anterior",
                "sFirst": "Primeiro",
                "sLast": "Último"
            },
            "oAria": {
                "sSortAscending": ": Ordenar colunas de forma ascendente",
                "sSortDescending": ": Ordenar colunas de forma descendente"
            }
        }
    };

    tabela = $('#tabelaItinerario').DataTable(tableOptions);

    tabela.clear();
    tabela.rows.add(data);
    $('#tabelaItinerario').wrap("<div class='meu-scroll'></div>");
    tabela.draw();

    $('#modalItinerario').modal('toggle');
}

function encontrarLinhas() {
    modalBody = document.getElementById("bodyModalLinhas");
    suaRua = document.getElementById('suarua').value;
    ruaDestino = document.getElementById('ruadestino').value;

    if (suaRua == "") {
        modalBody.innerHTML = "Favor inserir a sua rua."
    }
    else if (ruaDestino == "") {
        modalBody.innerHTML = "Favor inserir a rua destino."
    }
    else if (suaRua == ruaDestino) {
        modalBody.innerHTML = "A sua rua e a rua destino são iguais.";
    }
    else {
        var json = getJson();
        Ruas = json.Ruas;

        suaRuaID = Ruas.find(rua => rua.nome == suaRua);
        ruaDestinoID = Ruas.find(rua => rua.nome == ruaDestino);

        if (suaRuaID == undefined) {
            modalBody.innerHTML = "Não foi possível encontrar sua rua no banco de dados, tente selecionar uma outra rua próxima.";
        }

        else if (ruaDestinoID == undefined) {
            modalBody.innerHTML = "Não foi possível encontrar a rua destino no banco de dados, tente selecionar uma outra rua próxima.";
        }

        else {
            suaRuaID = suaRuaID.id;
            ruaDestinoID = ruaDestinoID.id;

            Linhas = json.Linhas;

            PossiveisLinhas = Linhas.filter(linha => {
                Ida_indexSuaRua = linha.ida.indexOf(suaRuaID);
                Ida_indexRuaDestino = linha.ida.indexOf(ruaDestinoID);

                Volta_indexSuaRua = linha.volta.indexOf(suaRuaID);
                Volta_indexRuaDestino = linha.volta.indexOf(ruaDestinoID);

                if (Ida_indexSuaRua > -1 && Ida_indexRuaDestino > -1) { //Verifica se as linhas estão presentes
                    if (Ida_indexSuaRua < Ida_indexRuaDestino) return true; //Verifica se primeiro passa na rua origem e deopis na destino
                }
                if (Volta_indexSuaRua > -1 && Volta_indexRuaDestino > -1) {
                    if (Volta_indexSuaRua < Volta_indexRuaDestino) return true;
                }

                return false;
            });

            if (PossiveisLinhas.length == 0) {
                modalBody.innerHTML = "Infelizmente, nenhuma linha passa por essas duas ruas :("
            }
            else {
                PossiveisLinhasTratadas = [];

                PossiveisLinhas.forEach(linha => {
                    PossiveisLinhasTratadas.push({
                        "numero": linha.numero,
                        "nome": linha.nomeLinha,
                        "empresa": linha.empresa,
                        "pontoFinal": linha.pontoFinal,
                        "pontoRetorno": linha.pontoRetorno,
                        "tarifa": linha.tarifa,
                        "itinerario": linha.numero
                    });
                });

                UpdateTableLinhas(PossiveisLinhasTratadas);
            }
        }
    }

    $('#modalLinhas').modal('toggle');
    return false;
}

function mostrarTodasAsLinhas() {
    Linhas = getJson().Linhas;
    LinhasTratadas = [];

    Linhas.forEach(linha => {
        LinhasTratadas.push({
            "numero": linha.numero,
            "nome": linha.nomeLinha,
            "empresa": linha.empresa,
            "pontoFinal": linha.pontoFinal,
            "pontoRetorno": linha.pontoRetorno,
            "tarifa": linha.tarifa,
            "itinerario": linha.numero
        });
    });

    UpdateTableLinhas(LinhasTratadas);

    $('#modalLinhas').modal('toggle');
}

$(window).scroll(function () {
    // 100 = The point you would like to fade the nav in.

    if ($(window).scrollTop() > 100) {

        $('.fixed').addClass('is-sticky');

    } else {

        $('.fixed').removeClass('is-sticky');

    };
});
function prepararAutoCompleteDasRuas() {
    var json = getJson();

    var ruas = []
    json.Ruas.forEach(rua => {
        ruas.push(rua.nome)
    })

    $('#suarua').autocomplete({
        lookup: ruas,
        lookupLimit: 15,
        noCache: true
    });

    $('#ruadestino').autocomplete({
        lookup: ruas,
        lookupLimit: 15,
        noCache: true
    });
}

function UpdateTableLinhas(data) {
    $("#bodyModalLinhas").html($('#scrollTabelaLinhas').html());
    tableOptions = {
        "rowCallback": function (settings, json) {
            // console.log('DataTables has finished its initialisation.');
            uai = $('#tabelaLinhas').DataTable();
            uai.columns.adjust();
        },
        "data": data,
        "columns": [
            { "data": "numero" },
            { "data": "nome" },
            { "data": "empresa" },
            { "data": "pontoFinal" },
            { "data": "pontoRetorno" },
            { "data": "tarifa" },
            {
                "data": "itinerario",
                "render": function (data, type, row, meta) {
                    if (type === 'display') {
                        data = '<a id="myLink" title="Clique para ver o itinerário dessa linha" href="#" onclick="mostrarItinerario(\'' + data + '\');return false;">Ver itinerário</a>';
                    }

                    return data;
                }
            }
        ],
        "bLengthChange": false,
        "bPaginate": false,
        "lengthMenu": [[6, 10, 25, 50, -1], [6, 10, 25, 50, "Todas"]],
        "pageLength": -1,
        scrollY: '50vh', //Altura
        scrollX: '100vh', //Largura
        fixedHeader: true,
        //Strings de idioma:
        "language": {
            "sEmptyTable": "Nenhum registro encontrado",
            "sInfo": "Mostrando _TOTAL_ linha(s)",
            "sInfoEmpty": "Mostrando 0 registros",
            "sInfoFiltered": "(Filtrados de _MAX_ registros)",
            "sInfoPostFix": "",
            "sInfoThousands": ".",
            "sLengthMenu": "_MENU_ resultados por página",
            "sLoadingRecords": "Carregando...",
            "sProcessing": "Processando...",
            "sZeroRecords": "Nenhum registro encontrado",
            "sSearch": "Pesquisar",
            "oPaginate": {
                "sNext": "Próximo",
                "sPrevious": "Anterior",
                "sFirst": "Primeiro",
                "sLast": "Último"
            },
            "oAria": {
                "sSortAscending": ": Ordenar colunas de forma ascendente",
                "sSortDescending": ": Ordenar colunas de forma descendente"
            }
        }
    };
    tabela = $('#tabelaLinhas').on('createdRow', function () {
        console.log('Table initialisation complete: ' + new Date().getTime());
        uai = $('#tabelaLinhas').DataTable();
        uai.columns.adjust();
        setTimeout(() => {
            uai.columns.adjust()
        }, (500));

    }).DataTable(tableOptions);
    $('#tabelaLinhas').on('init.dt', function () {
        console.log('POURA: ' + new Date().getTime());
    }).DataTable();
    tabela.clear();
    tabela.rows.add(data);

    // $('#tabelaLinhas').wrap("<div class='meu-scroll'></div>");
    tabela.draw();
    tabela.columns.adjust()

    setTimeout(() => {
        tabela.columns.adjust()
    }, (300));
}

$(document).ready(function () {
    prepararAutoCompleteDasRuas();
})

function getJson() {
    return [
        {
            "Linhas": [
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "0",
                    "ida": [
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                        "8",
                        "9",
                        "10",
                        "11",
                        "12",
                        "13",
                        "14",
                        "15",
                        "16",
                        "17",
                        "1",
                        "19",
                        "20",
                        "21",
                        "22",
                        "23",
                        "24",
                        "25",
                        "26",
                        "27",
                        "28",
                        "29",
                        "30",
                        "31",
                        "32",
                        "33",
                        "34",
                        "35",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "48",
                        "49",
                        "50",
                        "51",
                        "52",
                        "53",
                        "54",
                        "55",
                        "56",
                        "57",
                        "58"
                    ],
                    "nomeLinha": "JARDIM RIACHO / MARACANÃ VIA METRÔ",
                    "numero": "102",
                    "pontoFinal": "Rua/Av. mA",
                    "pontoRetorno": "Rua/Av. José Luiz da Cunha",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "60",
                        "61",
                        "62",
                        "49",
                        "63",
                        "47",
                        "46",
                        "64",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "65",
                        "36",
                        "35",
                        "34",
                        "33",
                        "30",
                        "29",
                        "28",
                        "27",
                        "26",
                        "66",
                        "23",
                        "24",
                        "25",
                        "21",
                        "67",
                        "15",
                        "14",
                        "69",
                        "70",
                        "12",
                        "11",
                        "10",
                        "9",
                        "8",
                        "7",
                        "6",
                        "71",
                        "4",
                        "3",
                        "2",
                        "1",
                        "72",
                        "1"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "1",
                    "ida": [
                        "73",
                        "74",
                        "72",
                        "75",
                        "76",
                        "77",
                        "78",
                        "53",
                        "52",
                        "51",
                        "79",
                        "61",
                        "80",
                        "49",
                        "81",
                        "47",
                        "46",
                        "64",
                        "42",
                        "82",
                        "83",
                        "84",
                        "85",
                        "86",
                        "87"
                    ],
                    "nomeLinha": "CABRAL / CIDADE INDUSTRIAL VIA METRÔ",
                    "numero": "570",
                    "pontoFinal": "Alameda dos Rouxinóis",
                    "pontoRetorno": "Rua/Av. Gal. David Sarnoff",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "86",
                        "88",
                        "89",
                        "90",
                        "91",
                        "92",
                        "93",
                        "94",
                        "89",
                        "95",
                        "96",
                        "97",
                        "96",
                        "77",
                        "76",
                        "98",
                        "72",
                        "99",
                        "73"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "2",
                    "ida": [
                        "100",
                        "101",
                        "102",
                        "103",
                        "104",
                        "105",
                        "106",
                        "107",
                        "101",
                        "108",
                        "43",
                        "110",
                        "111",
                        "112",
                        "113",
                        "114",
                        "115",
                        "116",
                        "117",
                        "118",
                        "119",
                        "120",
                        "114",
                        "121",
                        "122",
                        "123",
                        "124",
                        "125",
                        "124",
                        "126",
                        "127",
                        "128",
                        "47",
                        "46",
                        "64",
                        "42",
                        "36",
                        "129",
                        "130",
                        "131",
                        "132",
                        "133",
                        "134",
                        "135",
                        "136",
                        "137",
                        "86",
                        "87",
                        "85",
                        "82"
                    ],
                    "nomeLinha": "ICAIVERA/METRÔ VIA DARCY RIBEIRO",
                    "numero": "302b",
                    "pontoFinal": "Via de Acesso Icaivera",
                    "pontoRetorno": "Rua/Av. Babita Camargos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "139",
                        "63",
                        "140",
                        "141",
                        "128",
                        "127",
                        "142",
                        "124",
                        "125",
                        "124",
                        "123",
                        "121",
                        "114",
                        "120",
                        "119",
                        "118",
                        "117",
                        "116",
                        "114",
                        "113",
                        "112",
                        "111",
                        "110",
                        "143",
                        "144",
                        "101",
                        "107",
                        "106",
                        "105",
                        "145",
                        "114",
                        "103"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "3",
                    "ida": [
                        "146",
                        "60",
                        "147",
                        "148",
                        "149",
                        "150",
                        "60",
                        "61",
                        "80",
                        "49",
                        "81",
                        "140",
                        "141",
                        "128",
                        "152",
                        "153",
                        "154",
                        "155",
                        "108",
                        "156",
                        "157",
                        "158",
                        "159",
                        "160",
                        "33",
                        "162",
                        "163",
                        "25",
                        "164",
                        "165",
                        "162",
                        "166",
                        "167",
                        "165",
                        "26",
                        "168",
                        "23",
                        "24",
                        "25",
                        "21",
                        "67",
                        "21",
                        "169",
                        "82",
                        "170",
                        "85",
                        "171",
                        "172",
                        "173"
                    ],
                    "nomeLinha": "CIRCULAR CONTAGEM",
                    "numero": "001a",
                    "pontoFinal": "Rua/Av. Manoel João Diniz Camargos",
                    "pontoRetorno": "Rua/Av. Gal. David Sarnoff",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "82",
                        "174",
                        "37",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "42",
                        "175",
                        "42",
                        "176",
                        "156",
                        "43",
                        "42",
                        "175",
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "48",
                        "49",
                        "80",
                        "61",
                        "60",
                        "150",
                        "149",
                        "148",
                        "147",
                        "60",
                        "178",
                        "146"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "4",
                    "ida": [
                        "73",
                        "179",
                        "180",
                        "181",
                        "182",
                        "183",
                        "77",
                        "185",
                        "186",
                        "95",
                        "89",
                        "87",
                        "85",
                        "187",
                        "83",
                        "188",
                        "189",
                        "175",
                        "82"
                    ],
                    "nomeLinha": "CH. SANTA TEREZINHA/CID IND VIA METRÔ",
                    "numero": "474",
                    "pontoFinal": "Rua/Av. Romualdo José da Silva",
                    "pontoRetorno": "Rua/Av. Gal. David Sarnoff",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "42",
                        "89",
                        "95",
                        "186",
                        "97",
                        "190",
                        "191",
                        "182",
                        "181",
                        "180",
                        "179",
                        "73"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "5",
                    "ida": [
                        "192",
                        "193",
                        "194",
                        "195",
                        "196",
                        "197",
                        "198",
                        "199",
                        "200",
                        "201",
                        "198",
                        "202",
                        "203",
                        "204",
                        "199",
                        "205",
                        "1",
                        "206",
                        "1",
                        "1",
                        "19",
                        "20",
                        "207",
                        "208",
                        "23",
                        "24",
                        "25",
                        "26",
                        "209",
                        "210",
                        "211",
                        "25",
                        "163",
                        "162",
                        "212",
                        "160",
                        "159",
                        "157",
                        "156",
                        "214",
                        "215",
                        "216",
                        "217",
                        "218",
                        "219",
                        "220",
                        "221",
                        "222",
                        "223",
                        "224",
                        "153",
                        "154",
                        "226",
                        "128",
                        "47",
                        "46",
                        "64",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40"
                    ],
                    "nomeLinha": "CIRCULAR INDUSTRIAL",
                    "numero": "002a",
                    "pontoFinal": "Rua/Av. Um",
                    "pontoRetorno": "Rua/Av. Angicos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "41",
                        "36",
                        "35",
                        "34",
                        "227",
                        "228",
                        "229",
                        "230",
                        "231",
                        "232",
                        "233",
                        "28",
                        "235",
                        "236",
                        "237",
                        "238",
                        "170",
                        "238",
                        "239",
                        "240",
                        "239",
                        "241",
                        "242",
                        "243",
                        "244",
                        "245",
                        "195",
                        "246",
                        "192"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "6",
                    "ida": [
                        "247",
                        "248",
                        "249",
                        "250",
                        "251",
                        "252",
                        "251",
                        "253",
                        "254",
                        "255",
                        "256",
                        "257",
                        "258",
                        "259",
                        "260",
                        "127",
                        "128",
                        "47",
                        "46",
                        "64",
                        "42",
                        "82",
                        "85",
                        "171",
                        "85",
                        "170",
                        "82",
                        "173",
                        "82",
                        "85",
                        "263",
                        "87",
                        "85",
                        "82"
                    ],
                    "nomeLinha": "NOVA CONTAGEM/CIDADE INDUSTRIAL",
                    "numero": "302a",
                    "pontoFinal": "Rua/Av. Piedade",
                    "pontoRetorno": "Rua/Av. Babita Camargos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "42",
                        "43",
                        "44",
                        "45",
                        "47",
                        "139",
                        "63",
                        "140",
                        "141",
                        "128",
                        "127",
                        "260",
                        "258",
                        "264",
                        "256",
                        "255",
                        "254",
                        "253",
                        "266",
                        "267",
                        "251",
                        "252",
                        "251",
                        "250",
                        "249",
                        "247"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "7",
                    "ida": [
                        "268",
                        "269",
                        "113",
                        "270",
                        "253",
                        "254",
                        "255",
                        "256",
                        "272",
                        "258",
                        "259",
                        "273",
                        "127",
                        "128",
                        "47",
                        "46",
                        "64",
                        "42",
                        "82",
                        "173",
                        "82",
                        "85",
                        "263",
                        "87",
                        "85",
                        "82"
                    ],
                    "nomeLinha": "IPÊ AMARELO/CIDADE INDUSTRIAL",
                    "numero": "371",
                    "pontoFinal": "Rua/Av. dos Jequitibás",
                    "pontoRetorno": "Rua/Av. Babita Camargos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "139",
                        "81",
                        "140",
                        "141",
                        "128",
                        "127",
                        "273",
                        "258",
                        "272",
                        "256",
                        "255",
                        "254",
                        "253",
                        "275",
                        "113",
                        "276",
                        "268"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "8",
                    "ida": [
                        "277",
                        "278",
                        "279",
                        "280",
                        "273",
                        "127",
                        "281",
                        "60",
                        "80",
                        "49",
                        "81",
                        "47",
                        "46",
                        "64",
                        "42",
                        "82",
                        "85",
                        "284",
                        "85",
                        "170",
                        "82",
                        "173",
                        "82",
                        "85",
                        "263",
                        "87",
                        "288",
                        "174"
                    ],
                    "nomeLinha": "TUPÃ/ESTAÇÃO ELDORADO",
                    "numero": "302d",
                    "pontoFinal": "Rua/Av. Garças",
                    "pontoRetorno": "Rua/Av. Babita Camargos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "48",
                        "49",
                        "80",
                        "61",
                        "60",
                        "281",
                        "127",
                        "273",
                        "280",
                        "279",
                        "278",
                        "277"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "9",
                    "ida": [
                        "289",
                        "290",
                        "291",
                        "292",
                        "293",
                        "294",
                        "295",
                        "296",
                        "297",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "37",
                        "38",
                        "298",
                        "174",
                        "299",
                        "85",
                        "82",
                        "300",
                        "301",
                        "187",
                        "85",
                        "302",
                        "301",
                        "303",
                        "230",
                        "231",
                        "232",
                        "233",
                        "305",
                        "196",
                        "195",
                        "245",
                        "306",
                        "245",
                        "195",
                        "246",
                        "192"
                    ],
                    "nomeLinha": "PARQUE SÃO JOÃO/AMAZONAS",
                    "numero": "103",
                    "pontoFinal": "Rua/Av. das Nascentes",
                    "pontoRetorno": "Rua/Av. Três",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "290",
                        "308",
                        "309",
                        "196",
                        "305",
                        "233",
                        "232",
                        "231",
                        "310",
                        "311",
                        "312",
                        "313",
                        "314",
                        "315",
                        "82",
                        "170",
                        "85",
                        "171",
                        "301",
                        "300",
                        "82",
                        "317",
                        "37",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "42",
                        "297",
                        "296",
                        "295",
                        "294",
                        "318",
                        "292",
                        "319",
                        "320",
                        "321"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "10",
                    "ida": [
                        "322",
                        "323",
                        "324",
                        "325",
                        "326",
                        "327",
                        "328",
                        "329",
                        "330",
                        "331",
                        "325",
                        "332",
                        "333",
                        "334",
                        "335",
                        "332",
                        "336",
                        "337",
                        "338",
                        "339",
                        "340",
                        "341",
                        "342",
                        "343",
                        "344",
                        "345",
                        "346",
                        "347",
                        "222",
                        "223",
                        "224",
                        "153",
                        "154",
                        "349",
                        "226",
                        "128",
                        "47",
                        "46",
                        "64",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "65",
                        "36",
                        "42",
                        "82",
                        "85",
                        "171",
                        "352",
                        "173"
                    ],
                    "nomeLinha": "SAPUCAIAS/CIDADE INDUSTRIAL",
                    "numero": "307a",
                    "pontoFinal": "Rua/Av. 7",
                    "pontoRetorno": "Rua/Av. Angicos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "82",
                        "174",
                        "37",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "139",
                        "81",
                        "140",
                        "141",
                        "128",
                        "152",
                        "223",
                        "353",
                        "354",
                        "346",
                        "345",
                        "355",
                        "356",
                        "344",
                        "357",
                        "358",
                        "339",
                        "338",
                        "337",
                        "336",
                        "359",
                        "338",
                        "336",
                        "332",
                        "335",
                        "334",
                        "333",
                        "332",
                        "325",
                        "331",
                        "330",
                        "329",
                        "328",
                        "327",
                        "323",
                        "325",
                        "324",
                        "322"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "11",
                    "ida": [
                        "289",
                        "290",
                        "361",
                        "362",
                        "94",
                        "72",
                        "94",
                        "362",
                        "292",
                        "363",
                        "364",
                        "365",
                        "366",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40"
                    ],
                    "nomeLinha": "PARQUE SÃO JOÃO/METRÔ VIA HOSPITAL MUNIC",
                    "numero": "661",
                    "pontoFinal": "Rua/Av. das Nascentes",
                    "pontoRetorno": "Rua/Av. Angicos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "65",
                        "36",
                        "42",
                        "365",
                        "364",
                        "363",
                        "292",
                        "362",
                        "94",
                        "72",
                        "94",
                        "362",
                        "319",
                        "320",
                        "289"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "12",
                    "ida": [
                        "367",
                        "368",
                        "369",
                        "370",
                        "371",
                        "372",
                        "373",
                        "374",
                        "375",
                        "376",
                        "377",
                        "378",
                        "379",
                        "380",
                        "381",
                        "382",
                        "383",
                        "384",
                        "385",
                        "386",
                        "387",
                        "388",
                        "389",
                        "390",
                        "391",
                        "392",
                        "393",
                        "394",
                        "330",
                        "395",
                        "396",
                        "175",
                        "396",
                        "397",
                        "398",
                        "179",
                        "330",
                        "399",
                        "400",
                        "401",
                        "402",
                        "396",
                        "403",
                        "404",
                        "405",
                        "406",
                        "407",
                        "408",
                        "136",
                        "135",
                        "50",
                        "409",
                        "410",
                        "86",
                        "87",
                        "85",
                        "171",
                        "85",
                        "82"
                    ],
                    "nomeLinha": "NOVO PROGRESSO/CIDADE INDUSTRIAL/CENTRO",
                    "numero": "0403",
                    "pontoFinal": "Rua/Av. Xavantes",
                    "pontoRetorno": "Rua/Av. Babita Camargos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "48",
                        "50",
                        "51",
                        "52",
                        "53",
                        "415",
                        "186",
                        "407",
                        "406",
                        "405",
                        "330",
                        "416",
                        "396",
                        "402",
                        "401",
                        "400",
                        "399",
                        "330",
                        "179",
                        "398",
                        "397",
                        "396",
                        "391",
                        "417",
                        "418",
                        "393",
                        "392",
                        "391",
                        "390",
                        "389",
                        "388",
                        "387",
                        "386",
                        "385",
                        "384",
                        "383",
                        "382",
                        "381",
                        "380",
                        "379",
                        "378",
                        "377",
                        "376",
                        "375",
                        "421",
                        "373",
                        "372",
                        "371",
                        "424",
                        "369",
                        "426",
                        "367"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "13",
                    "ida": [
                        "322",
                        "323",
                        "324",
                        "325",
                        "326",
                        "327",
                        "328",
                        "329",
                        "330",
                        "331",
                        "325",
                        "427",
                        "336",
                        "428",
                        "429",
                        "338",
                        "339",
                        "340",
                        "341",
                        "342",
                        "343",
                        "344",
                        "345",
                        "346",
                        "399",
                        "430",
                        "431",
                        "89",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "41"
                    ],
                    "nomeLinha": "SAPUCAIAS/METRÔ VIA SÃO LUIZ",
                    "numero": "307b",
                    "pontoFinal": "Rua/Av. 7",
                    "pontoRetorno": "Rua/Av. José Faria da Rocha",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "36",
                        "42",
                        "89",
                        "433",
                        "156",
                        "214",
                        "215",
                        "216",
                        "217",
                        "218",
                        "436",
                        "220",
                        "221",
                        "354",
                        "346",
                        "345",
                        "355",
                        "356",
                        "344",
                        "357",
                        "358",
                        "339",
                        "338",
                        "429",
                        "428",
                        "336",
                        "359",
                        "338",
                        "336",
                        "427",
                        "325",
                        "331",
                        "330",
                        "329",
                        "328",
                        "327",
                        "326",
                        "325",
                        "324",
                        "322"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "14",
                    "ida": [
                        "441",
                        "442",
                        "443",
                        "442",
                        "150",
                        "444",
                        "445",
                        "446",
                        "447",
                        "448",
                        "449",
                        "450",
                        "451",
                        "150",
                        "452",
                        "61",
                        "80",
                        "49",
                        "63",
                        "47",
                        "46",
                        "64",
                        "43",
                        "156",
                        "176",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40"
                    ],
                    "nomeLinha": "EUROPA/METRÔ",
                    "numero": "301e",
                    "pontoFinal": "Rua/Av. Joaquim Soares Diniz",
                    "pontoRetorno": "Rua/Av. Angicos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "65",
                        "36",
                        "42",
                        "175",
                        "42",
                        "176",
                        "156",
                        "43",
                        "42",
                        "175",
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "48",
                        "49",
                        "80",
                        "61",
                        "60",
                        "150",
                        "453",
                        "454",
                        "446",
                        "455",
                        "446",
                        "456",
                        "446",
                        "457",
                        "441"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "15",
                    "ida": [
                        "459",
                        "460",
                        "78",
                        "461",
                        "77",
                        "462",
                        "463",
                        "464",
                        "186",
                        "94",
                        "93",
                        "90",
                        "467",
                        "468",
                        "132",
                        "469",
                        "50",
                        "409",
                        "410",
                        "86",
                        "87",
                        "85",
                        "187",
                        "470",
                        "84"
                    ],
                    "nomeLinha": "CAMPINA VERDE/CIDADE INDUSTRIAL",
                    "numero": "401d",
                    "pontoFinal": "Rua/Av. HORTÊNCIA",
                    "pontoRetorno": "Rua/Av. BABITA CAMARGOS",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "85",
                        "86",
                        "473",
                        "193",
                        "475",
                        "476",
                        "2",
                        "478",
                        "479",
                        "480",
                        "481",
                        "482",
                        "131",
                        "483",
                        "30",
                        "137",
                        "484",
                        "408",
                        "485",
                        "406",
                        "331",
                        "186",
                        "486",
                        "77",
                        "461",
                        "487",
                        "488",
                        "489",
                        "490",
                        "460",
                        "491",
                        "459"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "16",
                    "ida": [
                        "492",
                        "493",
                        "494",
                        "495",
                        "496",
                        "497",
                        "498",
                        "499",
                        "500",
                        "501",
                        "502",
                        "503",
                        "502",
                        "504",
                        "505",
                        "506",
                        "507",
                        "508",
                        "509",
                        "14",
                        "510",
                        "511",
                        "77",
                        "512",
                        "97",
                        "513",
                        "486",
                        "77",
                        "78",
                        "514",
                        "515",
                        "516",
                        "42",
                        "43",
                        "517",
                        "155",
                        "154",
                        "226"
                    ],
                    "nomeLinha": "NACIONAL/CENTRO",
                    "numero": "101c",
                    "pontoFinal": "Rua/Av. da Constituição",
                    "pontoRetorno": "Rua/Av. Bernardo Monteiro",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "128",
                        "47",
                        "139",
                        "49",
                        "50",
                        "51",
                        "52",
                        "514",
                        "78",
                        "77",
                        "512",
                        "97",
                        "513",
                        "77",
                        "511",
                        "510",
                        "14",
                        "521",
                        "522",
                        "509",
                        "508",
                        "507",
                        "196",
                        "505",
                        "504",
                        "502",
                        "503",
                        "502",
                        "501",
                        "523",
                        "499",
                        "498",
                        "497",
                        "496",
                        "495",
                        "494",
                        "493",
                        "492",
                        "524",
                        "525",
                        "526",
                        "492"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "17",
                    "ida": [
                        "146",
                        "60",
                        "528",
                        "529",
                        "530",
                        "10",
                        "531",
                        "532",
                        "533",
                        "52",
                        "51",
                        "79",
                        "80",
                        "61",
                        "49",
                        "63",
                        "47",
                        "46",
                        "517",
                        "534",
                        "43",
                        "156",
                        "176",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "39",
                        "535",
                        "536",
                        "537",
                        "129",
                        "130",
                        "131",
                        "132",
                        "133",
                        "467",
                        "538",
                        "382",
                        "539",
                        "135",
                        "136",
                        "541",
                        "542",
                        "484",
                        "408",
                        "136",
                        "137",
                        "175",
                        "137",
                        "30",
                        "483",
                        "131",
                        "137",
                        "86",
                        "85",
                        "82",
                        "173",
                        "172",
                        "544",
                        "545",
                        "546",
                        "547",
                        "548",
                        "549",
                        "545",
                        "214",
                        "175",
                        "214",
                        "552",
                        "553",
                        "554",
                        "555"
                    ],
                    "nomeLinha": "MARACANÃ/ÁGUA BRANCA/VILA SÃO PAULO ",
                    "numero": "173",
                    "pontoFinal": "Rua/Av. Manoel João Diniz Camargos",
                    "pontoRetorno": "Rua/Av. Gal. David Sarnoff",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "82",
                        "173",
                        "82",
                        "85",
                        "86",
                        "133",
                        "482",
                        "131",
                        "483",
                        "30",
                        "137",
                        "484",
                        "542",
                        "541",
                        "136",
                        "135",
                        "539",
                        "382",
                        "538",
                        "467",
                        "131",
                        "130",
                        "129",
                        "556",
                        "557",
                        "558",
                        "535",
                        "39",
                        "41",
                        "559",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "42",
                        "175",
                        "42",
                        "176",
                        "156",
                        "43",
                        "42",
                        "175",
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "48",
                        "49",
                        "50",
                        "51",
                        "52",
                        "533",
                        "532",
                        "531",
                        "10",
                        "530",
                        "529",
                        "528",
                        "60",
                        "178",
                        "146"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "18",
                    "ida": [
                        "562",
                        "563",
                        "564",
                        "565",
                        "566",
                        "567",
                        "568",
                        "569",
                        "568",
                        "570",
                        "571",
                        "572",
                        "402",
                        "573",
                        "574",
                        "575",
                        "399",
                        "576",
                        "417",
                        "326",
                        "308",
                        "394",
                        "578",
                        "579",
                        "580",
                        "509",
                        "14",
                        "521",
                        "581",
                        "582",
                        "583",
                        "510",
                        "511",
                        "77",
                        "185",
                        "186",
                        "584",
                        "585",
                        "2",
                        "476",
                        "475",
                        "325",
                        "588",
                        "86",
                        "87",
                        "85",
                        "82"
                    ],
                    "nomeLinha": "TIJUCA/SÃO JOAQUIM/ CID. IND.",
                    "numero": "401a",
                    "pontoFinal": "Rua/Av. Luz",
                    "pontoRetorno": "Rua/Av. Cal. Eugênio Pacelli",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "42",
                        "89",
                        "95",
                        "589",
                        "97",
                        "589",
                        "77",
                        "511",
                        "510",
                        "583",
                        "582",
                        "581",
                        "591",
                        "578",
                        "394",
                        "308",
                        "326",
                        "417",
                        "576",
                        "399",
                        "575",
                        "574",
                        "573",
                        "402",
                        "572",
                        "571",
                        "570",
                        "568",
                        "569",
                        "568",
                        "567",
                        "566",
                        "593",
                        "564",
                        "594",
                        "595",
                        "596",
                        "562"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "19",
                    "ida": [
                        "417",
                        "597",
                        "331",
                        "395",
                        "340",
                        "598",
                        "599",
                        "600",
                        "336",
                        "337",
                        "601",
                        "602",
                        "342",
                        "604",
                        "344",
                        "345",
                        "605",
                        "347",
                        "221",
                        "220",
                        "606",
                        "218",
                        "217",
                        "216",
                        "607",
                        "214",
                        "156",
                        "159",
                        "160",
                        "33",
                        "162",
                        "166",
                        "167",
                        "165",
                        "26",
                        "66",
                        "23",
                        "24",
                        "25",
                        "67",
                        "608",
                        "82",
                        "170"
                    ],
                    "nomeLinha": "TROPICAL/METRO - VIA CARREFOUR",
                    "numero": "305b",
                    "pontoFinal": "Rua/Av. Durval Alves de Faria(Rua/Av. A)",
                    "pontoRetorno": "Rua/Av. Gal. David Sarnoff",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "82",
                        "173",
                        "82",
                        "174",
                        "37",
                        "38",
                        "39",
                        "40",
                        "65",
                        "36",
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "139",
                        "63",
                        "140",
                        "141",
                        "128",
                        "152",
                        "609",
                        "610",
                        "611",
                        "612",
                        "613",
                        "614",
                        "615",
                        "616",
                        "617",
                        "618",
                        "619",
                        "325",
                        "400",
                        "597",
                        "417"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "20",
                    "ida": [
                        "1",
                        "621",
                        "175",
                        "1",
                        "205",
                        "622",
                        "623",
                        "198",
                        "624",
                        "197",
                        "196",
                        "244",
                        "306",
                        "626",
                        "237",
                        "627",
                        "240",
                        "242",
                        "629",
                        "630",
                        "631",
                        "632",
                        "633",
                        "634",
                        "2",
                        "635",
                        "636",
                        "633",
                        "637",
                        "638",
                        "639",
                        "640",
                        "641",
                        "642",
                        "643",
                        "555"
                    ],
                    "nomeLinha": "JARDIM RIACHO/CID. INDUSTRIAL/ELDORADO",
                    "numero": "402a",
                    "pontoFinal": "Rua/Av. Marte",
                    "pontoRetorno": "Rua/Av. Gal. David Sarnoff",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "82",
                        "173",
                        "82",
                        "174",
                        "37",
                        "38",
                        "39",
                        "40",
                        "39",
                        "644",
                        "35",
                        "42",
                        "297",
                        "42",
                        "35",
                        "645",
                        "21",
                        "66",
                        "23",
                        "24",
                        "25",
                        "21",
                        "646",
                        "67",
                        "15",
                        "14",
                        "1",
                        "1",
                        "621",
                        "1",
                        "72",
                        "1"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "21",
                    "ida": [
                        "647",
                        "253",
                        "254",
                        "255",
                        "256",
                        "257",
                        "258",
                        "259",
                        "260",
                        "127",
                        "128",
                        "47",
                        "46",
                        "64",
                        "42",
                        "82",
                        "85",
                        "171",
                        "85",
                        "170",
                        "82",
                        "173",
                        "82",
                        "85",
                        "263",
                        "87",
                        "85",
                        "82"
                    ],
                    "nomeLinha": "ESTALEIRO/ESTAÇÃO ELDORADO",
                    "numero": "302c",
                    "pontoFinal": "Antiga Estrada de Ribeirão das Neves",
                    "pontoRetorno": "Rua/Av. Babita Camargos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "139",
                        "81",
                        "140",
                        "141",
                        "128",
                        "127",
                        "260",
                        "258",
                        "264",
                        "256",
                        "255",
                        "254",
                        "253",
                        "647"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "22",
                    "ida": [
                        "326",
                        "309",
                        "649",
                        "650",
                        "651",
                        "652",
                        "653",
                        "654",
                        "655",
                        "656",
                        "657",
                        "658",
                        "659",
                        "660",
                        "661",
                        "662",
                        "663",
                        "664",
                        "665",
                        "666",
                        "667",
                        "668",
                        "669",
                        "52",
                        "51",
                        "79",
                        "61",
                        "80",
                        "49",
                        "81",
                        "140",
                        "141",
                        "128",
                        "152",
                        "153",
                        "154",
                        "155",
                        "108",
                        "671",
                        "156",
                        "176",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40"
                    ],
                    "nomeLinha": "PEROBAS/CENTRO DE CONTAGEM/METRÔ",
                    "numero": "306b",
                    "pontoFinal": "Rua/Av. Sete",
                    "pontoRetorno": "Rua/Av. Angicos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "65",
                        "36",
                        "42",
                        "175",
                        "42",
                        "176",
                        "156",
                        "43",
                        "42",
                        "175",
                        "42",
                        "43",
                        "517",
                        "155",
                        "672",
                        "128",
                        "47",
                        "139",
                        "49",
                        "50",
                        "51",
                        "52",
                        "669",
                        "668",
                        "667",
                        "666",
                        "665",
                        "664",
                        "663",
                        "662",
                        "659",
                        "674",
                        "657",
                        "656",
                        "655",
                        "654",
                        "676",
                        "652",
                        "651",
                        "650",
                        "649",
                        "651",
                        "326"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "23",
                    "ida": [
                        "677",
                        "536",
                        "678",
                        "679",
                        "680",
                        "681",
                        "39",
                        "322",
                        "682",
                        "678",
                        "683",
                        "682",
                        "127",
                        "128",
                        "47",
                        "46",
                        "64",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "37",
                        "38",
                        "684",
                        "174",
                        "299",
                        "85",
                        "38",
                        "687",
                        "173"
                    ],
                    "nomeLinha": "COLONIAL/CIDADE INDUSTRIAL",
                    "numero": "303",
                    "pontoFinal": "Rua/Av. Quaresmeiras",
                    "pontoRetorno": "Rua/Av. Gal. David Sarnoff",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "82",
                        "174",
                        "37",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "139",
                        "49",
                        "81",
                        "140",
                        "141",
                        "128",
                        "127",
                        "682",
                        "688",
                        "678",
                        "322",
                        "39",
                        "681",
                        "680",
                        "679",
                        "678",
                        "536",
                        "689"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "24",
                    "ida": [
                        "367",
                        "368",
                        "369",
                        "370",
                        "371",
                        "372",
                        "373",
                        "421",
                        "375",
                        "376",
                        "377",
                        "378",
                        "379",
                        "380",
                        "381",
                        "382",
                        "383",
                        "690",
                        "397",
                        "398",
                        "179",
                        "330",
                        "399",
                        "400",
                        "401",
                        "402",
                        "396",
                        "395",
                        "330",
                        "394",
                        "393",
                        "392",
                        "391",
                        "390",
                        "387",
                        "388",
                        "389",
                        "578",
                        "589",
                        "486",
                        "77",
                        "78",
                        "53",
                        "52",
                        "51",
                        "79",
                        "61",
                        "80",
                        "49",
                        "81",
                        "140",
                        "141",
                        "128",
                        "152",
                        "153",
                        "154",
                        "155",
                        "534",
                        "43",
                        "42",
                        "82",
                        "85",
                        "692"
                    ],
                    "nomeLinha": "NOVO PROGRESSO/CENTRO/CIDADE INUSTRIAL",
                    "numero": "0402",
                    "pontoFinal": "Rua/Av. Xavantes",
                    "pontoRetorno": "Rua/Av. Babita Camargos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "85",
                        "87",
                        "627",
                        "86",
                        "693",
                        "89",
                        "95",
                        "578",
                        "389",
                        "388",
                        "387",
                        "390",
                        "391",
                        "392",
                        "393",
                        "394",
                        "330",
                        "395",
                        "396",
                        "402",
                        "401",
                        "400",
                        "399",
                        "330",
                        "179",
                        "398",
                        "397",
                        "690",
                        "383",
                        "382",
                        "381",
                        "380",
                        "379",
                        "378",
                        "377",
                        "376",
                        "375",
                        "421",
                        "373",
                        "372",
                        "371",
                        "424",
                        "369",
                        "426",
                        "367"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "25",
                    "ida": [
                        "492",
                        "493",
                        "494",
                        "495",
                        "499",
                        "500",
                        "501",
                        "502",
                        "503",
                        "502",
                        "504",
                        "505",
                        "506",
                        "507",
                        "508",
                        "509",
                        "591",
                        "511",
                        "77",
                        "56",
                        "186",
                        "131",
                        "137",
                        "86",
                        "87",
                        "85",
                        "82",
                        "173",
                        "352",
                        "187",
                        "85",
                        "82"
                    ],
                    "nomeLinha": "NACIONAL/CIDADE INDUSTRIAL/ELDORADO",
                    "numero": "101a",
                    "pontoFinal": "Rua/Av. da Constituição",
                    "pontoRetorno": "Rua/Av. Cal. Eugênio Pacelli",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "42",
                        "89",
                        "95",
                        "513",
                        "97",
                        "77",
                        "511",
                        "591",
                        "509",
                        "508",
                        "507",
                        "196",
                        "505",
                        "504",
                        "502",
                        "503",
                        "502",
                        "501",
                        "523",
                        "499",
                        "495",
                        "494",
                        "493",
                        "492",
                        "524",
                        "525",
                        "526",
                        "492"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "26",
                    "ida": [
                        "699",
                        "700",
                        "701",
                        "702",
                        "273",
                        "127",
                        "128",
                        "47",
                        "46",
                        "64",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "65",
                        "36",
                        "42",
                        "82"
                    ],
                    "nomeLinha": "SOLAR DO MADEIRA/METRÔ/CIDADE INDUSTRIAL",
                    "numero": "301c",
                    "pontoFinal": "Rua/Av. das Araras",
                    "pontoRetorno": "Rua/Av. Babita Camargos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "85",
                        "171",
                        "352",
                        "173",
                        "82",
                        "174",
                        "37",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "139",
                        "81",
                        "140",
                        "141",
                        "128",
                        "127",
                        "273",
                        "702",
                        "701",
                        "700",
                        "699"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "27",
                    "ida": [
                        "289",
                        "290",
                        "291",
                        "292",
                        "703",
                        "294",
                        "704",
                        "705",
                        "297",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40"
                    ],
                    "nomeLinha": "PARQUE SÃO JOÃO/METRÔ",
                    "numero": "103r",
                    "pontoFinal": "Rua/Av. das Nascentes",
                    "pontoRetorno": "Rua/Av. Angicos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "65",
                        "36",
                        "42",
                        "297",
                        "706",
                        "294",
                        "703",
                        "292",
                        "319",
                        "320",
                        "289"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "28",
                    "ida": [
                        "707",
                        "708",
                        "33",
                        "709",
                        "645",
                        "711",
                        "33",
                        "712",
                        "713",
                        "714",
                        "230",
                        "229",
                        "228",
                        "227",
                        "34",
                        "715",
                        "35",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "65",
                        "36",
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "139",
                        "63"
                    ],
                    "nomeLinha": "CIRCULAR RIO COMPRIDO",
                    "numero": "003a",
                    "pontoFinal": "Rua/Av. Sócrates Mariani Bittencourt",
                    "pontoRetorno": "Rua/Av. Joaquim Rocha",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "140",
                        "141",
                        "128",
                        "152",
                        "609",
                        "612",
                        "716",
                        "717",
                        "152",
                        "223",
                        "353",
                        "354",
                        "221",
                        "719",
                        "219",
                        "218",
                        "721",
                        "216",
                        "607",
                        "214",
                        "156",
                        "159",
                        "160",
                        "33",
                        "162",
                        "163",
                        "722",
                        "33",
                        "723",
                        "707"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "29",
                    "ida": [
                        "1",
                        "621",
                        "175",
                        "1",
                        "1",
                        "19",
                        "724",
                        "21",
                        "66",
                        "23",
                        "24",
                        "25",
                        "26",
                        "27",
                        "645",
                        "175",
                        "645",
                        "35",
                        "726",
                        "35",
                        "36",
                        "727",
                        "728",
                        "36",
                        "42",
                        "35",
                        "644",
                        "729",
                        "39",
                        "41",
                        "460",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "42",
                        "82",
                        "173",
                        "82"
                    ],
                    "nomeLinha": "JARDIM RIACHO/ELDORADO/CIDADE INDUSTRIAL",
                    "numero": "402b",
                    "pontoFinal": "Rua/Av. Marte",
                    "pontoRetorno": "Rua/Av. Tito Fulgêncio",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "555",
                        "643",
                        "642",
                        "641",
                        "640",
                        "639",
                        "638",
                        "637",
                        "633",
                        "731",
                        "732",
                        "635",
                        "2",
                        "634",
                        "633",
                        "627",
                        "240",
                        "627",
                        "237",
                        "734",
                        "306",
                        "244",
                        "196",
                        "735",
                        "624",
                        "198",
                        "199",
                        "205",
                        "1",
                        "621",
                        "1",
                        "72",
                        "1"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "30",
                    "ida": [
                        "736",
                        "326",
                        "325",
                        "394",
                        "737",
                        "738",
                        "739",
                        "740",
                        "399",
                        "741",
                        "737",
                        "742",
                        "127",
                        "128",
                        "47",
                        "46",
                        "64",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "65",
                        "36",
                        "37",
                        "38",
                        "743",
                        "174",
                        "744",
                        "82",
                        "173"
                    ],
                    "nomeLinha": "CHÁCARAS DEL REY/METRÔ/CID. INDUSTRIAL",
                    "numero": "174",
                    "pontoFinal": "Rua/Av. Flor de Cactos",
                    "pontoRetorno": "Rua/Av. Gal. David Sarnoff",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "82",
                        "174",
                        "37",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "139",
                        "63",
                        "140",
                        "141",
                        "128",
                        "127",
                        "742",
                        "737",
                        "741",
                        "399",
                        "740",
                        "739",
                        "738",
                        "737",
                        "394",
                        "325",
                        "326",
                        "745"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "31",
                    "ida": [
                        "746",
                        "150",
                        "148",
                        "147",
                        "60",
                        "61",
                        "80",
                        "49",
                        "63",
                        "140",
                        "141",
                        "128",
                        "152",
                        "153",
                        "154",
                        "155",
                        "517",
                        "534",
                        "43",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "65",
                        "36",
                        "42",
                        "82",
                        "173",
                        "172",
                        "187",
                        "85",
                        "748"
                    ],
                    "nomeLinha": "CIRCULAR CONTAGEM/VILA MILITAR",
                    "numero": "170",
                    "pontoFinal": "Rua/Av. Levi Diniz Costa",
                    "pontoRetorno": "Rua/Av. Cardeal Eugênio Pacelli",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "172",
                        "608",
                        "208",
                        "23",
                        "25",
                        "166",
                        "162",
                        "165",
                        "211",
                        "25",
                        "163",
                        "162",
                        "212",
                        "160",
                        "159",
                        "156",
                        "108",
                        "671",
                        "43",
                        "42",
                        "43",
                        "517",
                        "155",
                        "154",
                        "226",
                        "128",
                        "47",
                        "139",
                        "49",
                        "80",
                        "61",
                        "60",
                        "147",
                        "148",
                        "150",
                        "751",
                        "325",
                        "746"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "32",
                    "ida": [
                        "752",
                        "753",
                        "754",
                        "755",
                        "756",
                        "753",
                        "757",
                        "758",
                        "759",
                        "760",
                        "761",
                        "597",
                        "762",
                        "763",
                        "764",
                        "765",
                        "342",
                        "343",
                        "344",
                        "345",
                        "346",
                        "354",
                        "222",
                        "766",
                        "155",
                        "534",
                        "43",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40"
                    ],
                    "nomeLinha": "ESTÂNCIAS IMPERIAIS/EST.ELDORADO",
                    "numero": "305d",
                    "pontoFinal": "Rua/Av. Servidão 1A",
                    "pontoRetorno": "Rua/Av. Angicos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "41",
                        "36",
                        "42",
                        "43",
                        "517",
                        "155",
                        "766",
                        "222",
                        "354",
                        "346",
                        "345",
                        "355",
                        "356",
                        "344",
                        "765",
                        "764",
                        "767",
                        "768",
                        "762",
                        "597",
                        "761",
                        "760",
                        "759",
                        "758",
                        "757",
                        "753",
                        "756",
                        "755",
                        "754",
                        "753",
                        "752"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "33",
                    "ida": [
                        "769",
                        "148",
                        "150",
                        "770",
                        "771",
                        "772",
                        "773",
                        "52",
                        "51",
                        "79",
                        "61",
                        "80",
                        "49",
                        "63",
                        "47",
                        "46",
                        "64",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "65",
                        "36",
                        "42",
                        "82",
                        "85",
                        "171",
                        "85",
                        "170",
                        "82",
                        "173"
                    ],
                    "nomeLinha": "PQUE RENASCER/CIDADE INDUSTRIAL",
                    "numero": "001c",
                    "pontoFinal": "Rua/Av. Benjamin Camargos",
                    "pontoRetorno": "Rua/Av. Gal. David Sarnoff",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "82",
                        "174",
                        "37",
                        "38",
                        "39",
                        "40",
                        "65",
                        "36",
                        "42",
                        "43",
                        "44",
                        "45",
                        "47",
                        "48",
                        "49",
                        "50",
                        "51",
                        "52",
                        "53",
                        "77",
                        "774",
                        "775",
                        "776",
                        "77",
                        "53",
                        "772",
                        "771",
                        "770",
                        "777",
                        "150",
                        "778",
                        "769"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "34",
                    "ida": [
                        "192",
                        "193",
                        "194",
                        "195",
                        "245",
                        "244",
                        "243",
                        "242",
                        "241",
                        "239",
                        "240",
                        "239",
                        "238",
                        "170",
                        "238",
                        "237",
                        "236",
                        "235",
                        "28",
                        "233",
                        "232",
                        "231",
                        "230",
                        "229",
                        "228",
                        "227",
                        "34",
                        "35",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40"
                    ],
                    "nomeLinha": "CIRCULAR INDUSTRIAL",
                    "numero": "002b",
                    "pontoFinal": "Rua/Av. Um",
                    "pontoRetorno": "Rua/Av. Angicos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "41",
                        "36",
                        "42",
                        "43",
                        "44",
                        "45",
                        "47",
                        "139",
                        "63",
                        "140",
                        "141",
                        "49",
                        "128",
                        "152",
                        "223",
                        "353",
                        "221",
                        "220",
                        "219",
                        "218",
                        "217",
                        "216",
                        "607",
                        "214",
                        "156",
                        "159",
                        "160",
                        "33",
                        "162",
                        "163",
                        "781",
                        "211",
                        "210",
                        "209",
                        "26",
                        "66",
                        "23",
                        "24",
                        "25",
                        "207",
                        "782",
                        "15",
                        "14",
                        "1",
                        "206",
                        "1",
                        "205",
                        "199",
                        "204",
                        "198",
                        "201",
                        "198",
                        "197",
                        "244",
                        "245",
                        "195",
                        "246",
                        "192"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "35",
                    "ida": [
                        "783",
                        "784",
                        "785",
                        "786",
                        "787",
                        "788",
                        "789",
                        "790",
                        "791",
                        "792",
                        "593",
                        "566",
                        "567",
                        "568",
                        "793",
                        "794",
                        "793",
                        "795",
                        "796",
                        "797",
                        "798",
                        "799",
                        "800",
                        "508",
                        "509",
                        "591",
                        "511",
                        "77",
                        "185",
                        "801",
                        "95",
                        "89",
                        "802",
                        "42",
                        "82",
                        "83",
                        "803"
                    ],
                    "nomeLinha": "XANGRILÁ/ELDORADO",
                    "numero": "101b",
                    "pontoFinal": "Rua/Av. Cel. Murta",
                    "pontoRetorno": "Rua/Av. Babita Camargos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "85",
                        "86",
                        "87",
                        "693",
                        "89",
                        "95",
                        "801",
                        "77",
                        "511",
                        "510",
                        "591",
                        "509",
                        "508",
                        "800",
                        "799",
                        "798",
                        "797",
                        "796",
                        "795",
                        "793",
                        "794",
                        "793",
                        "568",
                        "567",
                        "566",
                        "593",
                        "792",
                        "791",
                        "790",
                        "789",
                        "788",
                        "787",
                        "786",
                        "785",
                        "784",
                        "783"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "36",
                    "ida": [
                        "417",
                        "597",
                        "576",
                        "395",
                        "328",
                        "400",
                        "597",
                        "619",
                        "325",
                        "400",
                        "395",
                        "340",
                        "89",
                        "598",
                        "599",
                        "600",
                        "336",
                        "805",
                        "338",
                        "340",
                        "341",
                        "342",
                        "343",
                        "344",
                        "345",
                        "346",
                        "399",
                        "430",
                        "431",
                        "89",
                        "802",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40"
                    ],
                    "nomeLinha": "TROPICAL/METRO",
                    "numero": "301a",
                    "pontoFinal": "Rua/Av. Durval Alves de Faria (Rua/Av. A)",
                    "pontoRetorno": "Rua/Av. Angicos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "41",
                        "36",
                        "42",
                        "802",
                        "89",
                        "340",
                        "806",
                        "220",
                        "221",
                        "347",
                        "346",
                        "345",
                        "355",
                        "356",
                        "344",
                        "765",
                        "764",
                        "767",
                        "768",
                        "762",
                        "331",
                        "395",
                        "619",
                        "584",
                        "400",
                        "328",
                        "395",
                        "329",
                        "597",
                        "417"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "37",
                    "ida": [
                        "214",
                        "809",
                        "214",
                        "627",
                        "240",
                        "627",
                        "237",
                        "626",
                        "306",
                        "244",
                        "245",
                        "195",
                        "246",
                        "588",
                        "812",
                        "192",
                        "355",
                        "10",
                        "9",
                        "8",
                        "7",
                        "6",
                        "69",
                        "12",
                        "13",
                        "14",
                        "15",
                        "21",
                        "17",
                        "1",
                        "19",
                        "20",
                        "813",
                        "66",
                        "23",
                        "24",
                        "25",
                        "26",
                        "27",
                        "28",
                        "29",
                        "30",
                        "31",
                        "814",
                        "34",
                        "35",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "41",
                        "36",
                        "42",
                        "43",
                        "44",
                        "45",
                        "46",
                        "47",
                        "48",
                        "49",
                        "50",
                        "51",
                        "52",
                        "53",
                        "54",
                        "815",
                        "816",
                        "817",
                        "147"
                    ],
                    "nomeLinha": "BANDEIRANTES/MARACANÃ VIA METRÔ",
                    "numero": "810",
                    "pontoFinal": "Rua/Av. Tereza Cristina",
                    "pontoRetorno": "Rua/Av. José Luiz da Cunha",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "60",
                        "61",
                        "80",
                        "49",
                        "63",
                        "47",
                        "46",
                        "64",
                        "42",
                        "36",
                        "37",
                        "38",
                        "819",
                        "65",
                        "36",
                        "35",
                        "34",
                        "33",
                        "30",
                        "29",
                        "28",
                        "27",
                        "26",
                        "66",
                        "23",
                        "24",
                        "25",
                        "813",
                        "67",
                        "15",
                        "14",
                        "69",
                        "6",
                        "7",
                        "8",
                        "9",
                        "10",
                        "355",
                        "192",
                        "812",
                        "588",
                        "246",
                        "195",
                        "245",
                        "244",
                        "306",
                        "626",
                        "237",
                        "627",
                        "240",
                        "627",
                        "214"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "38",
                    "ida": [
                        "417",
                        "597",
                        "400",
                        "325",
                        "619",
                        "618",
                        "617",
                        "616",
                        "615",
                        "614",
                        "613",
                        "612",
                        "611",
                        "610",
                        "609",
                        "152",
                        "820",
                        "224",
                        "153",
                        "154",
                        "349",
                        "226",
                        "128",
                        "47",
                        "46",
                        "64",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "65",
                        "36",
                        "42",
                        "82",
                        "85",
                        "692",
                        "821",
                        "173",
                        "82",
                        "170",
                        "82",
                        "822",
                        "310",
                        "231",
                        "823",
                        "608",
                        "21",
                        "22",
                        "23",
                        "24"
                    ],
                    "nomeLinha": "TROPICAL VIA ELDORADO/METRÔ",
                    "numero": "305a",
                    "pontoFinal": "Rua/Av. Durval Alves de Faria (Rua/Av. A)",
                    "pontoRetorno": "Rua/Av. Mantiqueira",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "25",
                        "824",
                        "162",
                        "212",
                        "160",
                        "159",
                        "156",
                        "214",
                        "215",
                        "216",
                        "217",
                        "218",
                        "219",
                        "220",
                        "221",
                        "354",
                        "605",
                        "345",
                        "355",
                        "356",
                        "344",
                        "602",
                        "601",
                        "337",
                        "336",
                        "359",
                        "338",
                        "826",
                        "827",
                        "764",
                        "767",
                        "768",
                        "762",
                        "597",
                        "417"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "39",
                    "ida": [
                        "326",
                        "828",
                        "649",
                        "179",
                        "651",
                        "652",
                        "829",
                        "661",
                        "830",
                        "661",
                        "831",
                        "659",
                        "832",
                        "833",
                        "656",
                        "655",
                        "654",
                        "834",
                        "835",
                        "128",
                        "836",
                        "837",
                        "42",
                        "36",
                        "37",
                        "38",
                        "39",
                        "40",
                        "65",
                        "36",
                        "42",
                        "82",
                        "85",
                        "838"
                    ],
                    "nomeLinha": "PEROBAS/TRÊS BARRAS/SHOPPING ITAÚ",
                    "numero": "306c",
                    "pontoFinal": "Rua/Av. Sete",
                    "pontoRetorno": "Rua/Av. Cal. Eugênio Pacelli",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "172",
                        "173",
                        "82",
                        "174",
                        "37",
                        "38",
                        "39",
                        "40",
                        "65",
                        "36",
                        "42",
                        "128",
                        "835",
                        "834",
                        "654",
                        "655",
                        "656",
                        "657",
                        "674",
                        "659",
                        "831",
                        "661",
                        "830",
                        "661",
                        "829",
                        "652",
                        "651",
                        "650",
                        "649",
                        "651",
                        "326"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO NORTE",
                    "id": "40",
                    "ida": [
                        "123",
                        "839",
                        "840",
                        "841",
                        "124",
                        "842",
                        "124",
                        "126",
                        "127",
                        "128",
                        "47",
                        "46",
                        "64",
                        "42",
                        "82",
                        "85",
                        "171",
                        "85",
                        "170",
                        "82",
                        "173",
                        "82",
                        "85",
                        "263",
                        "87",
                        "85",
                        "82"
                    ],
                    "nomeLinha": "DARCY RIBEIRO / CID INDUSTRIAL VIA METRÔ",
                    "numero": "302e",
                    "pontoFinal": "Rua/Av. Romeu Diniz",
                    "pontoRetorno": "Rua/Av. Babita Camargos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "42",
                        "43",
                        "44",
                        "845",
                        "46",
                        "47",
                        "139",
                        "63",
                        "140",
                        "141",
                        "128",
                        "127",
                        "126",
                        "124",
                        "125",
                        "124",
                        "841",
                        "840",
                        "846",
                        "123"
                    ]
                },
                {
                    "empresa": "CONSÓRCIO SUL",
                    "id": "41",
                    "ida": [
                        "847",
                        "193",
                        "849",
                        "850",
                        "851",
                        "852",
                        "853",
                        "854",
                        "855",
                        "856",
                        "663",
                        "791",
                        "859",
                        "193",
                        "861",
                        "506",
                        "507",
                        "196",
                        "863",
                        "864",
                        "73",
                        "74",
                        "72",
                        "75",
                        "865",
                        "77",
                        "185",
                        "867",
                        "131",
                        "137",
                        "86",
                        "87",
                        "85",
                        "302"
                    ],
                    "nomeLinha": "VALE DAS AMENDOEIRAS/CIDADE INDUSTRIAL",
                    "numero": "101d",
                    "pontoFinal": "Rua/Av. José Soares da Costa Neto",
                    "pontoRetorno": "Rua/Av. Babita Camargos",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "85",
                        "86",
                        "137",
                        "484",
                        "869",
                        "407",
                        "406",
                        "856",
                        "867",
                        "97",
                        "77",
                        "865",
                        "75",
                        "72",
                        "74",
                        "73",
                        "864",
                        "863",
                        "196",
                        "507",
                        "872",
                        "873",
                        "861",
                        "859",
                        "791",
                        "663",
                        "856",
                        "855",
                        "854",
                        "853",
                        "852",
                        "851",
                        "850",
                        "849",
                        "193",
                        "879",
                        "847"
                    ]
                },
                {
                    "empresa": "Consórcio Norte",
                    "id": "42",
                    "ida": [
                        "248",
                        "94",
                        "882",
                        "267",
                        "275",
                        "113",
                        "276",
                        "268",
                        "269",
                        "113",
                        "275",
                        "253",
                        "254",
                        "255",
                        "256",
                        "257",
                        "258",
                        "259",
                        "273",
                        "883",
                        "742",
                        "884",
                        "770",
                        "772",
                        "53",
                        "78",
                        "77",
                        "512",
                        "97"
                    ],
                    "nomeLinha": "NOVA CONTAGEM / CEASA",
                    "numero": "350",
                    "pontoFinal": "Rua/Av. VC3",
                    "pontoRetorno": "Rua/Av. Marcelino Teonilo gomes",
                    "tarifa": "R$ 4.35 (Cartão Ótimo) e R$ 4.50 (Dinheiro)",
                    "volta": [
                        "186",
                        "885",
                        "486",
                        "77",
                        "78",
                        "53",
                        "772",
                        "770",
                        "777",
                        "884",
                        "742",
                        "883",
                        "273",
                        "259",
                        "258",
                        "264",
                        "256",
                        "255",
                        "254",
                        "253",
                        "275",
                        "113",
                        "276",
                        "268",
                        "269",
                        "113",
                        "267",
                        "248"
                    ]
                }
            ],
            "Ruas": [
                {
                    "id": "1",
                    "nome": "Rua/Av. Marte"
                },
                {
                    "id": "2",
                    "nome": "Rua/Av. Alfa"
                },
                {
                    "id": "3",
                    "nome": "Rua/Av. Rigel"
                },
                {
                    "id": "4",
                    "nome": "Rua/Av. Pégasus"
                },
                {
                    "id": "5",
                    "nome": "Rua/Av. Cel. Salvador Fernandes"
                },
                {
                    "id": "6",
                    "nome": "Rua/Av. Padre Gonçalves Lopes"
                },
                {
                    "id": "7",
                    "nome": "Rua/Av. Bartolomeu Bueno"
                },
                {
                    "id": "8",
                    "nome": "Rua/Av. Amador Bueno"
                },
                {
                    "id": "9",
                    "nome": "Rua/Av. dos Franciscanos"
                },
                {
                    "id": "10",
                    "nome": "Praça da Bandeira"
                },
                {
                    "id": "11",
                    "nome": "Rua/Av. Paes Leme"
                },
                {
                    "id": "12",
                    "nome": "Rua/Av. Monsenhor Messias"
                },
                {
                    "id": "13",
                    "nome": "Rua/Av. dos Franceses"
                },
                {
                    "id": "14",
                    "nome": "Rua/Av. Cristal"
                },
                {
                    "id": "15",
                    "nome": "Rua/Av. Centauro"
                },
                {
                    "id": "16",
                    "nome": "Marginal da BR 38"
                },
                {
                    "id": "17",
                    "nome": "Rua/Av. Riacho das Pedras"
                },
                {
                    "id": "19",
                    "nome": "Rua/Av. Plutão"
                },
                {
                    "id": "20",
                    "nome": "Viaduto da Hípica"
                },
                {
                    "id": "21",
                    "nome": "Marginal da BR 381"
                },
                {
                    "id": "22",
                    "nome": "Rua/Av. Rio Pium I"
                },
                {
                    "id": "23",
                    "nome": "Rua/Av. Rio Nilo"
                },
                {
                    "id": "24",
                    "nome": "Estação Rio Nilo"
                },
                {
                    "id": "25",
                    "nome": "Rua/Av. Rio Mantiqueira"
                },
                {
                    "id": "26",
                    "nome": "Rua/Av. Rio Paranaguá"
                },
                {
                    "id": "27",
                    "nome": "Rua/Av. Rio Colorado"
                },
                {
                    "id": "28",
                    "nome": "Rua/Av. Rio Negro"
                },
                {
                    "id": "29",
                    "nome": "Rua/Av. Rio Xingu"
                },
                {
                    "id": "30",
                    "nome": "Rua/Av. Rio Mossoró"
                },
                {
                    "id": "31",
                    "nome": "Rua/Av. Odécio Vicente da Silva (Rio Verde)"
                },
                {
                    "id": "32",
                    "nome": "Rua/Av. S"
                },
                {
                    "id": "33",
                    "nome": "Rua/Av. Rio Comprido"
                },
                {
                    "id": "34",
                    "nome": "Praça Raimunda Rodrigues Magela (Praça Mercado)"
                },
                {
                    "id": "35",
                    "nome": "Rua/Av. Olímpio Garcia"
                },
                {
                    "id": "36",
                    "nome": "Rua/Av. José Faria da Rocha"
                },
                {
                    "id": "37",
                    "nome": "Rua/Av. Delfim Moreira"
                },
                {
                    "id": "38",
                    "nome": "Rua/Av. Mal. Costa e Silva"
                },
                {
                    "id": "39",
                    "nome": "Rua/Av. Jequitibás"
                },
                {
                    "id": "40",
                    "nome": "Metrô"
                },
                {
                    "id": "41",
                    "nome": "Rua/Av. Angicos"
                },
                {
                    "id": "42",
                    "nome": "Rua/Av. João César de Oliveira"
                },
                {
                    "id": "43",
                    "nome": "Rua/Av. João de Deus Costa"
                },
                {
                    "id": "44",
                    "nome": "Rua/Av. Ana Aleixo"
                },
                {
                    "id": "45",
                    "nome": "Rua/Av. Capitão Antônio Joaquim da Paixão"
                },
                {
                    "id": "46",
                    "nome": "Rua/Av. Francisco Miguel"
                },
                {
                    "id": "47",
                    "nome": "Rua/Av. Dr. Cassiano"
                },
                {
                    "id": "48",
                    "nome": "Rua/Av. Maria da Conceição de São José"
                },
                {
                    "id": "49",
                    "nome": "Rua/Av. Bueno Brandão"
                },
                {
                    "id": "50",
                    "nome": "Rua/Av. Joaquim Camargos"
                },
                {
                    "id": "51",
                    "nome": "Rua/Av. Miguel de Souza Arruda"
                },
                {
                    "id": "52",
                    "nome": "Rua/Av. Virgínia Graciosi Pacelli"
                },
                {
                    "id": "53",
                    "nome": "Rodovia Vereador Joaquim Costa (VM5)"
                },
                {
                    "id": "54",
                    "nome": "Rua/Av. Maria Olinda do Nascimento"
                },
                {
                    "id": "55",
                    "nome": "Praça Pau de Óleo"
                },
                {
                    "id": "56",
                    "nome": "Rua/Av. Vereador Dias Diniz (Rua/Av. 15)"
                },
                {
                    "id": "57",
                    "nome": "Rua/Av. José de Lucas Oliveira (Rua/Av. Angustura)"
                },
                {
                    "id": "58",
                    "nome": "Rua/Av. Francisco D Ávila."
                },
                {
                    "id": "60",
                    "nome": "Rua/Av. José Luiz da Cunha"
                },
                {
                    "id": "61",
                    "nome": "Rua/Av. Manoel Alves"
                },
                {
                    "id": "62",
                    "nome": "Praça Farmac. João da Rocha (do Rosário)"
                },
                {
                    "id": "63",
                    "nome": "Praça Silviano Brandão (Praça São Gonçalo)"
                },
                {
                    "id": "64",
                    "nome": "Rua/Av. Cel. João Camargos"
                },
                {
                    "id": "65",
                    "nome": "Rua/Av. dos Angicos"
                },
                {
                    "id": "66",
                    "nome": "Rua/Av. Rio Pium-I"
                },
                {
                    "id": "67",
                    "nome": "Viaduto Colúmbia"
                },
                {
                    "id": "69",
                    "nome": "Rua/Av. Camilo Schiara"
                },
                {
                    "id": "70",
                    "nome": "Rua/Av. dos Húngaros"
                },
                {
                    "id": "71",
                    "nome": "Rua/Av. Cel Salvador Fernandes"
                },
                {
                    "id": "72",
                    "nome": "Rotatória"
                },
                {
                    "id": "73",
                    "nome": "Rua/Av. Wilson Tavares Ribeiro"
                },
                {
                    "id": "74",
                    "nome": "Alameda dos Comerciantes"
                },
                {
                    "id": "75",
                    "nome": "Alameda dos Sabiás"
                },
                {
                    "id": "76",
                    "nome": "Al dos Rouxinois"
                },
                {
                    "id": "77",
                    "nome": "Rua/Av. das Américas"
                },
                {
                    "id": "78",
                    "nome": "Rua/Av. Hibisco"
                },
                {
                    "id": "79",
                    "nome": "Rua/Av. Dom Silvério"
                },
                {
                    "id": "80",
                    "nome": "Praça Farmac. João da Rocha Cunha (do Rosário)"
                },
                {
                    "id": "81",
                    "nome": "Praça Silviano Brandão ( Praça São Gonçalo)"
                },
                {
                    "id": "82",
                    "nome": "Rua/Av. Gal. David Sarnoff"
                },
                {
                    "id": "83",
                    "nome": "Rua/Av. Antônio Chagas Diniz"
                },
                {
                    "id": "84",
                    "nome": "Rua/Av. Osório de Morais"
                },
                {
                    "id": "85",
                    "nome": "Rua/Av. Babita Camargos"
                },
                {
                    "id": "86",
                    "nome": "Rua/Av. Teleférico"
                },
                {
                    "id": "87",
                    "nome": "Terminal Eldorado"
                },
                {
                    "id": "88",
                    "nome": "Alça de Acesso à Via Expressa"
                },
                {
                    "id": "89",
                    "nome": "Via Expressa"
                },
                {
                    "id": "90",
                    "nome": "Rua/Av. Treze de Maio"
                },
                {
                    "id": "91",
                    "nome": "Rua/Av. Continental"
                },
                {
                    "id": "92",
                    "nome": "Rua/Av. Sebastião Viana"
                },
                {
                    "id": "93",
                    "nome": "Rua/Av. Simão Antônio"
                },
                {
                    "id": "94",
                    "nome": "Rua/Av. Ápio Cardoso"
                },
                {
                    "id": "95",
                    "nome": "Rua/Av. Helena de Vasconcelos Costa"
                },
                {
                    "id": "96",
                    "nome": "Rodovia. BR-040"
                },
                {
                    "id": "97",
                    "nome": "Ceasa"
                },
                {
                    "id": "98",
                    "nome": "Al dos Sábias"
                },
                {
                    "id": "99",
                    "nome": "Al dos Comerciantes"
                },
                {
                    "id": "100",
                    "nome": "Via de acesso Icaivera"
                },
                {
                    "id": "101",
                    "nome": "Rua/Av. Flor de Liz (antiga Rua/Av. 4)"
                },
                {
                    "id": "102",
                    "nome": "Rua/Av. Gardênia (antiga Rua/Av. 11)"
                },
                {
                    "id": "103",
                    "nome": "Via de Acesso Icaivera"
                },
                {
                    "id": "104",
                    "nome": "Rua/Av. Carmélia (antiga Rua/Av. 14)"
                },
                {
                    "id": "105",
                    "nome": "Rua/Av. Flor do Campo (antiga Rua/Av. 22)"
                },
                {
                    "id": "106",
                    "nome": "Rua/Av. Tulipa (antiga Rua/Av. 24)"
                },
                {
                    "id": "107",
                    "nome": "Rua/Av. Ipê Amarelo (antiga Rua/Av. 25)"
                },
                {
                    "id": "108",
                    "nome": "Rua/Av. Joaquim José"
                },
                {
                    "id": "110",
                    "nome": "Rua/Av. 4 C"
                },
                {
                    "id": "111",
                    "nome": "Rua/Av. Amundaba"
                },
                {
                    "id": "112",
                    "nome": "Rua/Av. Oryba"
                },
                {
                    "id": "113",
                    "nome": "Rua/Av. Principal"
                },
                {
                    "id": "114",
                    "nome": "Rua/Av. Sema"
                },
                {
                    "id": "115",
                    "nome": "Rua/Av. Pirapanema"
                },
                {
                    "id": "116",
                    "nome": "Rua/Av. Yete"
                },
                {
                    "id": "117",
                    "nome": "Rua/Av. Sycaba"
                },
                {
                    "id": "118",
                    "nome": "Rua/Av. Morossema"
                },
                {
                    "id": "119",
                    "nome": "Rua/Av. Ati"
                },
                {
                    "id": "120",
                    "nome": "Rua/Av. Picassu"
                },
                {
                    "id": "121",
                    "nome": "Rua/Av. Capão das Cobras"
                },
                {
                    "id": "122",
                    "nome": "Rua/Av. Geraldo Magela Belém"
                },
                {
                    "id": "123",
                    "nome": "Rua/Av. Romeu Diniz"
                },
                {
                    "id": "124",
                    "nome": "Rua/Av. Stela Diniz Macedo"
                },
                {
                    "id": "125",
                    "nome": "Rua/Av. Milton Alves do Vale"
                },
                {
                    "id": "126",
                    "nome": "Rodovia Vereador José Ferreira (MG 432 - LMG 808)"
                },
                {
                    "id": "127",
                    "nome": "Rua/Av. do Registro"
                },
                {
                    "id": "128",
                    "nome": "Rua/Av. Bernardo Monteiro"
                },
                {
                    "id": "129",
                    "nome": "Rua/Av. Damas Ribeiro"
                },
                {
                    "id": "130",
                    "nome": "Viaduto Damas Ribeiro"
                },
                {
                    "id": "131",
                    "nome": "Rua/Av. Cardeal Arco Verde"
                },
                {
                    "id": "132",
                    "nome": "Rua/Av. Nossa Senhora do Carmo"
                },
                {
                    "id": "133",
                    "nome": "Rua/Av. Nossa Senhora de Fátima"
                },
                {
                    "id": "134",
                    "nome": "Rua/Av. Paulo Sérgio"
                },
                {
                    "id": "135",
                    "nome": "Rua/Av. Água Branca"
                },
                {
                    "id": "136",
                    "nome": "Rua/Av. Antônio Raposo"
                },
                {
                    "id": "137",
                    "nome": "Rua/Av. Pio XII"
                },
                {
                    "id": "139",
                    "nome": "Rua/Av. Presidente Kennedy"
                },
                {
                    "id": "140",
                    "nome": "Rua/Av. Joaquim Rocha"
                },
                {
                    "id": "141",
                    "nome": "Rua/Av. Santa Helena"
                },
                {
                    "id": "142",
                    "nome": "Rodovia Vereador José Ferreira (MG 432 - LGM 808)"
                },
                {
                    "id": "143",
                    "nome": "Rua/Av. João de Deus"
                },
                {
                    "id": "144",
                    "nome": "Rua/Av. Sítio da Lagoa"
                },
                {
                    "id": "145",
                    "nome": "Rua/Av. Camélia (antiga Rua/Av. 14)"
                },
                {
                    "id": "146",
                    "nome": "Rua/Av. Manoel João Diniz Camargos"
                },
                {
                    "id": "147",
                    "nome": "Rua/Av. Santo Lenho"
                },
                {
                    "id": "148",
                    "nome": "Rua/Av. Che Guevara"
                },
                {
                    "id": "149",
                    "nome": "Rua/Av. Galdino Monteiro da Silva (Rua/Av. A)"
                },
                {
                    "id": "150",
                    "nome": "Rua/Av. Padre Joaquim Martins"
                },
                {
                    "id": "152",
                    "nome": "Rua/Av. Camilo Alves (Rua/Av. 7)"
                },
                {
                    "id": "153",
                    "nome": "Rua/Av. Frei Domingos Godin"
                },
                {
                    "id": "154",
                    "nome": "Rua/Av. Dona Herculina"
                },
                {
                    "id": "155",
                    "nome": "Rua/Av. Cel. Augusto Camargos"
                },
                {
                    "id": "156",
                    "nome": "Rua/Av. Reginaldo de Souza Lima"
                },
                {
                    "id": "157",
                    "nome": "Rua/Av. Santo Antônio"
                },
                {
                    "id": "158",
                    "nome": "Viaduto Bernardo Monteiro"
                },
                {
                    "id": "159",
                    "nome": "Rua/Av. Manoel Pereira Mendes"
                },
                {
                    "id": "160",
                    "nome": "Rua/Av. Belo Horizonte"
                },
                {
                    "id": "162",
                    "nome": "Rua/Av. Padre José Maria de Man (Rua/Av. Rio Minho)"
                },
                {
                    "id": "163",
                    "nome": "Rua/Av. Corcovado"
                },
                {
                    "id": "164",
                    "nome": "Rua/Av. Rio Tibre"
                },
                {
                    "id": "165",
                    "nome": "Rua/Av. Rio Solimões"
                },
                {
                    "id": "166",
                    "nome": "Rua/Av. Rio Elba"
                },
                {
                    "id": "167",
                    "nome": "Rua/Av. Rio Araguari"
                },
                {
                    "id": "168",
                    "nome": "Rua/Av. rio Pium-I"
                },
                {
                    "id": "169",
                    "nome": "Rodovia BR-381"
                },
                {
                    "id": "170",
                    "nome": "Praça dos Trabalhadores"
                },
                {
                    "id": "171",
                    "nome": "Praça Antônio Mourão Guimarães (Praça da CEMIG)"
                },
                {
                    "id": "172",
                    "nome": "Rua/Av. Cardeal Eugênio Pacelli"
                },
                {
                    "id": "173",
                    "nome": "Praça Papa João XXIII (Praça B)"
                },
                {
                    "id": "174",
                    "nome": "Rua/Av. Mal. Castelo Branco"
                },
                {
                    "id": "175",
                    "nome": "Retorno"
                },
                {
                    "id": "176",
                    "nome": "Rua/Av. Maria da Glória Rocha"
                },
                {
                    "id": "178",
                    "nome": "Rua/Av. Antônio Pio da Rocha"
                },
                {
                    "id": "179",
                    "nome": "Rua/Av. 10"
                },
                {
                    "id": "180",
                    "nome": "Rua/Av. Mandarim"
                },
                {
                    "id": "181",
                    "nome": "Rua/Av. México"
                },
                {
                    "id": "182",
                    "nome": "Rua/Av. Chile"
                },
                {
                    "id": "183",
                    "nome": "Rua/Av. Quatro"
                },
                {
                    "id": "185",
                    "nome": "Rua/Av. Ver. Dias Diniz (Rua/Av. 15)"
                },
                {
                    "id": "186",
                    "nome": "Rodovia BR-040"
                },
                {
                    "id": "187",
                    "nome": "Rua/Av. Antônio Gonçalves Neto"
                },
                {
                    "id": "188",
                    "nome": "Rua/Av. Tom Jobim"
                },
                {
                    "id": "189",
                    "nome": "Rua/Av. General David Sarnoff"
                },
                {
                    "id": "190",
                    "nome": "Rodovia BR - 040"
                },
                {
                    "id": "191",
                    "nome": "Rua/Av. Presidente Getúlio Vargas"
                },
                {
                    "id": "192",
                    "nome": "Rua/Av. Um"
                },
                {
                    "id": "193",
                    "nome": "Rua/Av. Dois"
                },
                {
                    "id": "194",
                    "nome": "Rua/Av. Arterial"
                },
                {
                    "id": "195",
                    "nome": "Praça Santa Maria"
                },
                {
                    "id": "196",
                    "nome": "Rua/Av. Santa Maria"
                },
                {
                    "id": "197",
                    "nome": "Rua/Av. dos Cravos"
                },
                {
                    "id": "198",
                    "nome": "Rua/Av. Cel. Durval de Barros"
                },
                {
                    "id": "199",
                    "nome": "Rua/Av. Geremias Alves"
                },
                {
                    "id": "200",
                    "nome": "Rua/Av. Wilma Andrade"
                },
                {
                    "id": "201",
                    "nome": "Praça Zulmira Campos"
                },
                {
                    "id": "202",
                    "nome": "Rua/Av. Gávea"
                },
                {
                    "id": "203",
                    "nome": "Rua/Av. Alfa Gomes"
                },
                {
                    "id": "204",
                    "nome": "Rua/Av. Leblon"
                },
                {
                    "id": "205",
                    "nome": "Rua/Av. Estrela Dalva"
                },
                {
                    "id": "206",
                    "nome": "Rua/Av. Régulos"
                },
                {
                    "id": "207",
                    "nome": "Marginal da BR - 381"
                },
                {
                    "id": "208",
                    "nome": "Rua/Av. Pium I"
                },
                {
                    "id": "209",
                    "nome": "Rua/Av. Rio Congo"
                },
                {
                    "id": "210",
                    "nome": "Rua/Av. Rio Doce"
                },
                {
                    "id": "211",
                    "nome": "Rua/Av. Rio Ganges"
                },
                {
                    "id": "212",
                    "nome": "Rua/Av. Américo Santiago Piacenza"
                },
                {
                    "id": "214",
                    "nome": "Rua/Av. Tereza Cristina"
                },
                {
                    "id": "215",
                    "nome": "Rua/Av. José Paulino de Oliveira Leôncio"
                },
                {
                    "id": "216",
                    "nome": "Rua/Av. Vicente dos Santos (Penetração Quatro)"
                },
                {
                    "id": "217",
                    "nome": "Rua/Av. Ligação um"
                },
                {
                    "id": "218",
                    "nome": "Rua/Av. Itambacuri"
                },
                {
                    "id": "219",
                    "nome": "Rua/Av. Elza Fernandes Carneiro (Penetração Sete)"
                },
                {
                    "id": "220",
                    "nome": "Rua/Av. Geraldo Januário da Silva (Perimetral 2)"
                },
                {
                    "id": "221",
                    "nome": "Ad. Várzea Flores (Rua/Av. Teodoro M da Silva)"
                },
                {
                    "id": "222",
                    "nome": "Rua/Av. Almerinda da Costa Ribeiro (Rua/Av. 17)"
                },
                {
                    "id": "223",
                    "nome": "Rua/Av. Maria da Natividade Lopes"
                },
                {
                    "id": "224",
                    "nome": "Rua/Av. Délio da Consolação Rocha (Rua/Av. 8)"
                },
                {
                    "id": "226",
                    "nome": "Rua/Av. Domingos Diniz Moreira"
                },
                {
                    "id": "227",
                    "nome": "Rua/Av. Jair Rodrigues Valle"
                },
                {
                    "id": "228",
                    "nome": "Praça Marília de Dirceu"
                },
                {
                    "id": "229",
                    "nome": "Rua/Av. Frei Henrique Soares"
                },
                {
                    "id": "230",
                    "nome": "Rua/Av. Cel. Jove Soares Nogueira"
                },
                {
                    "id": "231",
                    "nome": "Rua/Av. Alvarenga Peixoto"
                },
                {
                    "id": "232",
                    "nome": "Rua/Av. Rio Madeira"
                },
                {
                    "id": "233",
                    "nome": "Rua/Av. Japurá"
                },
                {
                    "id": "235",
                    "nome": "Rua/Av. Maria da Glória"
                },
                {
                    "id": "236",
                    "nome": "Rua/Av. Amapá"
                },
                {
                    "id": "237",
                    "nome": "Rua/Av. Tiradentes"
                },
                {
                    "id": "238",
                    "nome": "Rua/Av. Monsenhor João Rodrigues"
                },
                {
                    "id": "239",
                    "nome": "Rua/Av. Benjamim Guimarães"
                },
                {
                    "id": "240",
                    "nome": "Praça Adelaide de Castro"
                },
                {
                    "id": "241",
                    "nome": "Praça São José do Operário"
                },
                {
                    "id": "242",
                    "nome": "Rua/Av. Cel. Benjamim Guimarães"
                },
                {
                    "id": "243",
                    "nome": "Rua/Av. Aderbal Rodrigues Vaz"
                },
                {
                    "id": "244",
                    "nome": "Rua/Av. Manjericão"
                },
                {
                    "id": "245",
                    "nome": "Rua/Av. Maria Inês"
                },
                {
                    "id": "246",
                    "nome": "Rua/Av. Maria Rita"
                },
                {
                    "id": "247",
                    "nome": "Rua/Av. Piedade"
                },
                {
                    "id": "248",
                    "nome": "Rua/Av. VC 3"
                },
                {
                    "id": "249",
                    "nome": "Rua/Av. VL 13"
                },
                {
                    "id": "250",
                    "nome": "Rua/Av. VL 15"
                },
                {
                    "id": "251",
                    "nome": "Rua/Av. VL 17"
                },
                {
                    "id": "252",
                    "nome": "Rua/Av. VL 20"
                },
                {
                    "id": "253",
                    "nome": "Rua/Av. VP1"
                },
                {
                    "id": "254",
                    "nome": "Rua/Av. Retiro dos Imigrantes"
                },
                {
                    "id": "255",
                    "nome": "Rua/Av. Retiro dos Esportistas"
                },
                {
                    "id": "256",
                    "nome": "Rua/Av. Retiro das Esmeraldas"
                },
                {
                    "id": "257",
                    "nome": "Rua/Av. Estância do Retiro"
                },
                {
                    "id": "258",
                    "nome": "Rua/Av. Rio Retiro"
                },
                {
                    "id": "259",
                    "nome": "Trevo"
                },
                {
                    "id": "260",
                    "nome": "Rodovia Vereador José Ferreira (MG-432-LMG 808)"
                },
                {
                    "id": "263",
                    "nome": "Complexo Viário Água Branca"
                },
                {
                    "id": "264",
                    "nome": "Rua/Av. Ilha do Retiro"
                },
                {
                    "id": "266",
                    "nome": "Rua/Av. VC 4"
                },
                {
                    "id": "267",
                    "nome": "Rua/Av. VP2"
                },
                {
                    "id": "268",
                    "nome": "Rua/Av. dos Coqueiros"
                },
                {
                    "id": "269",
                    "nome": "Rua/Av. dos Ipês"
                },
                {
                    "id": "270",
                    "nome": "Rua/Av. VC 5"
                },
                {
                    "id": "272",
                    "nome": "Rua/Av. Barragem do Retiro"
                },
                {
                    "id": "273",
                    "nome": "Rodovia Vereador José Ferreira (MG 432- LMG 808)"
                },
                {
                    "id": "275",
                    "nome": "Rua/Av. VC5"
                },
                {
                    "id": "276",
                    "nome": "Rua/Av. dos Jequitibás"
                },
                {
                    "id": "277",
                    "nome": "Rua/Av. Garças"
                },
                {
                    "id": "278",
                    "nome": "Praça Sem Nome"
                },
                {
                    "id": "279",
                    "nome": "Rua/Av. E"
                },
                {
                    "id": "280",
                    "nome": "Via Mun. José Veridiano Montarroyos"
                },
                {
                    "id": "281",
                    "nome": "Rua/Av. Nossa Senhora da Conceição"
                },
                {
                    "id": "284",
                    "nome": "Praça Antônio Mourão Guimarães(Praça da CEMIG)"
                },
                {
                    "id": "288",
                    "nome": "Alça de acesso para a Rua/Av. Mal. Castelo Branco"
                },
                {
                    "id": "289",
                    "nome": "Rua/Av. das Nascentes"
                },
                {
                    "id": "290",
                    "nome": "Rua/Av. Três"
                },
                {
                    "id": "291",
                    "nome": "Rua/Av. Guarupi (Rua/Av. 16)"
                },
                {
                    "id": "292",
                    "nome": "Rua/Av. das Indústrias"
                },
                {
                    "id": "293",
                    "nome": "Rua/Av. Tamoatá"
                },
                {
                    "id": "294",
                    "nome": "Rua/Av. Possuá"
                },
                {
                    "id": "295",
                    "nome": "Rua/Av. Tapijara"
                },
                {
                    "id": "296",
                    "nome": "Rua/Av. Dr. João Augusto da Fonseca Silva"
                },
                {
                    "id": "297",
                    "nome": "Praça Paulo Pinheiro Chagas"
                },
                {
                    "id": "298",
                    "nome": "Rua/Av. Mal. Hermes da fonseca"
                },
                {
                    "id": "299",
                    "nome": "Alça de acesso à Rua/Av. Babita Camargos"
                },
                {
                    "id": "300",
                    "nome": "Praça Papa João XXII (Praça B)"
                },
                {
                    "id": "301",
                    "nome": "Rua/Av. Cardeal Eugênio Pacelii"
                },
                {
                    "id": "302",
                    "nome": "Praça Antônio Mourão Guimarães (Praça da Cemig)"
                },
                {
                    "id": "303",
                    "nome": "Rodovia. Fernão Dias"
                },
                {
                    "id": "305",
                    "nome": "Rua/Av. Maria Margarida"
                },
                {
                    "id": "306",
                    "nome": "Rua/Av. Industrial"
                },
                {
                    "id": "308",
                    "nome": "Rua/Av. 4"
                },
                {
                    "id": "309",
                    "nome": "Rua/Av. 6"
                },
                {
                    "id": "310",
                    "nome": "Rua/Av. Tereza Gonçalves"
                },
                {
                    "id": "311",
                    "nome": "Rua/Av. Dorinato Lima"
                },
                {
                    "id": "312",
                    "nome": "Rua/Av. Clodomiro de Oliveira"
                },
                {
                    "id": "313",
                    "nome": "Rua/Av. Lafaiete"
                },
                {
                    "id": "314",
                    "nome": "Rua/Av. Tomás Andrade"
                },
                {
                    "id": "315",
                    "nome": "Rua/Av. Joaquim Tavares"
                },
                {
                    "id": "317",
                    "nome": "Rua/Av. Mal. Castelo Branco Branco"
                },
                {
                    "id": "318",
                    "nome": "Rua/Av. Jacuma"
                },
                {
                    "id": "319",
                    "nome": "Rua/Av. Francisco Alves"
                },
                {
                    "id": "320",
                    "nome": "Rua/Av. Guaxupé (Rua/Av. 5)"
                },
                {
                    "id": "321",
                    "nome": "Rua/Av. Das Nascentes"
                },
                {
                    "id": "322",
                    "nome": "Rua/Av. Jatobá"
                },
                {
                    "id": "323",
                    "nome": "Rua/Av. Paraju (Rua/Av. 7)"
                },
                {
                    "id": "324",
                    "nome": "Rotatória do bairro Sapucaias III"
                },
                {
                    "id": "325",
                    "nome": "Rua/Av. 2"
                },
                {
                    "id": "326",
                    "nome": "Rua/Av. 7"
                },
                {
                    "id": "327",
                    "nome": "Rua/Av. 12"
                },
                {
                    "id": "328",
                    "nome": "Rua/Av. 23"
                },
                {
                    "id": "329",
                    "nome": "Rua/Av. 22"
                },
                {
                    "id": "330",
                    "nome": "Rua/Av. 18"
                },
                {
                    "id": "331",
                    "nome": "Rua/Av. 20"
                },
                {
                    "id": "332",
                    "nome": "Rua/Av. Das Tulipas"
                },
                {
                    "id": "333",
                    "nome": "Rua/Av. Dos Antúrios"
                },
                {
                    "id": "334",
                    "nome": "Rua/Av. Das Violetas"
                },
                {
                    "id": "335",
                    "nome": "Rua/Av. Sempre Vivas"
                },
                {
                    "id": "336",
                    "nome": "Rua/Av. Simonésia"
                },
                {
                    "id": "337",
                    "nome": "Rua/Av. Monte Belo"
                },
                {
                    "id": "338",
                    "nome": "Rua/Av. Mamoré"
                },
                {
                    "id": "339",
                    "nome": "Rua/Av. Barra Feliz"
                },
                {
                    "id": "340",
                    "nome": "Marginal da Via Expressa"
                },
                {
                    "id": "341",
                    "nome": "Rua/Av. Imbiruçu"
                },
                {
                    "id": "342",
                    "nome": "Rua/Av. Refinaria Manguinhos"
                },
                {
                    "id": "343",
                    "nome": "Rua/Av. Óleo Diesel"
                },
                {
                    "id": "344",
                    "nome": "Rua/Av. Refinaria Duque de Caxias"
                },
                {
                    "id": "345",
                    "nome": "Rua/Av. da Gasolina"
                },
                {
                    "id": "346",
                    "nome": "Rua/Av. Pará"
                },
                {
                    "id": "347",
                    "nome": "Rua/Av. Renato Azeredo"
                },
                {
                    "id": "349",
                    "nome": "Praça Tancredo Neves"
                },
                {
                    "id": "352",
                    "nome": "Rua/Av. Cal. Eugênio Pacelli"
                },
                {
                    "id": "353",
                    "nome": "Rua/Av. José Antônio Tomas Filho (Rua/Av. 16)"
                },
                {
                    "id": "354",
                    "nome": "Rodovia Renato Azeredo"
                },
                {
                    "id": "355",
                    "nome": "Rua/Av. Ipiranga"
                },
                {
                    "id": "356",
                    "nome": "Rua/Av. Refinaria União"
                },
                {
                    "id": "357",
                    "nome": "Rua/Av. do Piche"
                },
                {
                    "id": "358",
                    "nome": "Rua/Av. Ingá"
                },
                {
                    "id": "359",
                    "nome": "Rua/Av. Vitória"
                },
                {
                    "id": "361",
                    "nome": "Rua/Av. Guarupi (Rua16)"
                },
                {
                    "id": "362",
                    "nome": "Rua/Av. Onze"
                },
                {
                    "id": "363",
                    "nome": "Rua/Av. Itabaiana"
                },
                {
                    "id": "364",
                    "nome": "Rua/Av. Necésio Tavares"
                },
                {
                    "id": "365",
                    "nome": "Rua/Av. José Pedro Araújo"
                },
                {
                    "id": "366",
                    "nome": "Rua/Av. Trajano de Araújo Viana"
                },
                {
                    "id": "367",
                    "nome": "Rua/Av. Iguaçaba"
                },
                {
                    "id": "368",
                    "nome": "Rua/Av. Itinga"
                },
                {
                    "id": "369",
                    "nome": "Rua/Av. Xavantes"
                },
                {
                    "id": "370",
                    "nome": "Rua/Av. Dr. Antônio Aleixo"
                },
                {
                    "id": "371",
                    "nome": "Rua/Av. Leni Amaral"
                },
                {
                    "id": "372",
                    "nome": "Rua/Av. Dr. Alvimar Carneiro"
                },
                {
                    "id": "373",
                    "nome": "Rua/Av. Dr. Mariano de Oliveira"
                },
                {
                    "id": "374",
                    "nome": "Rua/Av. Paraopeba"
                },
                {
                    "id": "375",
                    "nome": "Rua/Av. Extrema"
                },
                {
                    "id": "376",
                    "nome": "Rua/Av. Vinhático"
                },
                {
                    "id": "377",
                    "nome": "Rua/Av. Nômade"
                },
                {
                    "id": "378",
                    "nome": "Rua/Av. Cedro"
                },
                {
                    "id": "379",
                    "nome": "Rua/Av. Buriti"
                },
                {
                    "id": "380",
                    "nome": "Rua/Av. Cerejeira"
                },
                {
                    "id": "381",
                    "nome": "Rua/Av. Jequitibá"
                },
                {
                    "id": "382",
                    "nome": "Rua/Av. das Bandeiras"
                },
                {
                    "id": "383",
                    "nome": "Rua/Av. Fernão Dias"
                },
                {
                    "id": "384",
                    "nome": "Praça do Divino"
                },
                {
                    "id": "385",
                    "nome": "Rua/Av. Macaúbas"
                },
                {
                    "id": "386",
                    "nome": "Rua/Av. Pequi"
                },
                {
                    "id": "387",
                    "nome": "Rua/Av. Acácia"
                },
                {
                    "id": "388",
                    "nome": "Rua/Av. Ébano"
                },
                {
                    "id": "389",
                    "nome": "Rua/Av. Bueno do Prado"
                },
                {
                    "id": "390",
                    "nome": "Rua/Av. Candeia"
                },
                {
                    "id": "391",
                    "nome": "Rua/Av. 34"
                },
                {
                    "id": "392",
                    "nome": "Rua/Av. 27"
                },
                {
                    "id": "393",
                    "nome": "Rua/Av. 26"
                },
                {
                    "id": "394",
                    "nome": "Rua/Av. 1"
                },
                {
                    "id": "395",
                    "nome": "Rua/Av. 19"
                },
                {
                    "id": "396",
                    "nome": "Rua/Av. João Gomes Cardoso"
                },
                {
                    "id": "397",
                    "nome": "Rua/Av. Monsenhor João Martins"
                },
                {
                    "id": "398",
                    "nome": "Rua/Av. Hermes da Fonseca (Rua/Av. 7)"
                },
                {
                    "id": "399",
                    "nome": "Rua/Av. 15"
                },
                {
                    "id": "400",
                    "nome": "Rua/Av. C"
                },
                {
                    "id": "401",
                    "nome": "Rua/Av. José Mendes Ferreira"
                },
                {
                    "id": "402",
                    "nome": "Rua/Av. N"
                },
                {
                    "id": "403",
                    "nome": "Rua/Av. J"
                },
                {
                    "id": "404",
                    "nome": "Rua/Av. 16"
                },
                {
                    "id": "405",
                    "nome": "Rua/Av. 28"
                },
                {
                    "id": "406",
                    "nome": "Túnel do Morada Nova"
                },
                {
                    "id": "407",
                    "nome": "Rua/Av. Emboabas"
                },
                {
                    "id": "408",
                    "nome": "Rua/Av. Sinval Alves da Cunha"
                },
                {
                    "id": "409",
                    "nome": "Rua/Av. Sete"
                },
                {
                    "id": "410",
                    "nome": "Rua/Av. AO"
                },
                {
                    "id": "415",
                    "nome": "Rua/Av. Gardênia"
                },
                {
                    "id": "416",
                    "nome": "Rua/Av. 14"
                },
                {
                    "id": "417",
                    "nome": "Rua/Av. 25"
                },
                {
                    "id": "418",
                    "nome": "Rua/Av. 30"
                },
                {
                    "id": "421",
                    "nome": "Rua/Av. paraopeba"
                },
                {
                    "id": "424",
                    "nome": "Rua/Av. General Mascarenhas"
                },
                {
                    "id": "426",
                    "nome": "Rua/Av. Orissanga"
                },
                {
                    "id": "427",
                    "nome": "Rua/Av. das Tulipas"
                },
                {
                    "id": "428",
                    "nome": "Rua/Av. Matipó"
                },
                {
                    "id": "429",
                    "nome": "Rua/Av. Madeira"
                },
                {
                    "id": "430",
                    "nome": "Rua/Av. Terezinha"
                },
                {
                    "id": "431",
                    "nome": "Rua/Av. Nova Iorque"
                },
                {
                    "id": "433",
                    "nome": "Rua/Av. Caetano"
                },
                {
                    "id": "436",
                    "nome": "Rua/Av. Elza Fernandes Carneiro(Penetração Sete)"
                },
                {
                    "id": "441",
                    "nome": "Rua/Av. Joaquim Soares Diniz (antiga Rua/Av. Onze)"
                },
                {
                    "id": "442",
                    "nome": "Rua/Av. Dulce Geralda Diniz (Rua/Av. A)"
                },
                {
                    "id": "443",
                    "nome": "Rua/Av. Vicente Ribeiro de Paula"
                },
                {
                    "id": "444",
                    "nome": "Rua/Av. Antônio Pinto Lana (Rua/Av. Hamburgo)"
                },
                {
                    "id": "445",
                    "nome": "Rua/Av. José de Paula Filho (Rua/Av. Veneza)"
                },
                {
                    "id": "446",
                    "nome": "Rua/Av. José dos Santos Diniz (Rua/Av. Europa)"
                },
                {
                    "id": "447",
                    "nome": "Rua/Av. Arthur Cedro (Rua/Av. Nápolis)"
                },
                {
                    "id": "448",
                    "nome": "Rua/Av. José Tavares dos Santos (Rua/Av. Lisboa)"
                },
                {
                    "id": "449",
                    "nome": "Rua/Av. Isaías José Diniz (Rua/Av. Munique)"
                },
                {
                    "id": "450",
                    "nome": "Rua/Av. Joaquim José Diniz (Rua/Av. Madri)"
                },
                {
                    "id": "451",
                    "nome": "Rua/Av. Padre Eustáquio"
                },
                {
                    "id": "452",
                    "nome": "Rua/Av. José Luiz de Cunha"
                },
                {
                    "id": "453",
                    "nome": "Rua/Av. Padre Esutáquio"
                },
                {
                    "id": "454",
                    "nome": "Rua/Av. Joaquim José Diniz (Rua/Av. Monique)"
                },
                {
                    "id": "455",
                    "nome": "Rua/Av. Arthur Cedro (Niápolis)"
                },
                {
                    "id": "456",
                    "nome": "Rua/Av. Farmac. Lírio de C. Marques (Amisterdam)"
                },
                {
                    "id": "457",
                    "nome": "Rua/Av. Dulce Geralda (Rua/Av. A)"
                },
                {
                    "id": "459",
                    "nome": "Rua/Av. Hortência"
                },
                {
                    "id": "460",
                    "nome": "Rua/Av. das Acácias"
                },
                {
                    "id": "461",
                    "nome": "Via Vereador Joaquim Costa (VM5)"
                },
                {
                    "id": "462",
                    "nome": "Rua/Av. 13"
                },
                {
                    "id": "463",
                    "nome": "Rua/Av. Adão Sabino da Silva"
                },
                {
                    "id": "464",
                    "nome": "Rua/Av. Osias Marcelino dos Santos (Rua/Av. 15)"
                },
                {
                    "id": "467",
                    "nome": "Rua/Av. Santana"
                },
                {
                    "id": "468",
                    "nome": "Rua/Av. Batista Sampaio"
                },
                {
                    "id": "469",
                    "nome": "Rua/Av. Adalmo Passos Lopes (Rua/Av. 5)"
                },
                {
                    "id": "470",
                    "nome": "Rua/Av. Dr. Antônio Chagas Diniz"
                },
                {
                    "id": "473",
                    "nome": "Travessa 7"
                },
                {
                    "id": "475",
                    "nome": "Rua/Av. Humaitá"
                },
                {
                    "id": "476",
                    "nome": "Rua/Av. Heliodora"
                },
                {
                    "id": "478",
                    "nome": "Rua/Av. Baependi"
                },
                {
                    "id": "479",
                    "nome": "Rua/Av. Ibati"
                },
                {
                    "id": "480",
                    "nome": "Rua/Av. Custódio Maia"
                },
                {
                    "id": "481",
                    "nome": "Rua/Av. Santa Terezinha"
                },
                {
                    "id": "482",
                    "nome": "Rua/Av. São José"
                },
                {
                    "id": "483",
                    "nome": "Rua/Av. Rio Sanhoá"
                },
                {
                    "id": "484",
                    "nome": "Rua/Av. Vicente Lopes da Rocha (Rua/Av. 7)"
                },
                {
                    "id": "485",
                    "nome": "Rua/Av. dos Emboabas"
                },
                {
                    "id": "486",
                    "nome": "Rua/Av. Helena Rodrigues Barbosa (Rua/Av. 5)"
                },
                {
                    "id": "487",
                    "nome": "Rua/Av. Jasmin, Rua/Av. Petúnia"
                },
                {
                    "id": "488",
                    "nome": "Rua/Av. Flor de Seda"
                },
                {
                    "id": "489",
                    "nome": "Rua/Av. Flor de Ipê"
                },
                {
                    "id": "490",
                    "nome": "Rua/Av. Girassol"
                },
                {
                    "id": "491",
                    "nome": "Rua/Av. Dália"
                },
                {
                    "id": "492",
                    "nome": "Rua/Av. da Constituição"
                },
                {
                    "id": "493",
                    "nome": "Rua/Av. da Assembléia"
                },
                {
                    "id": "494",
                    "nome": "Rua/Av. Brasileira"
                },
                {
                    "id": "495",
                    "nome": "Rua/Av. Dona Rita Camargos"
                },
                {
                    "id": "496",
                    "nome": "Rua/Av. Bom Jesus"
                },
                {
                    "id": "497",
                    "nome": "Rua/Av. Carlos Magno"
                },
                {
                    "id": "498",
                    "nome": "Rua/Av. Maria Aparecida"
                },
                {
                    "id": "499",
                    "nome": "Rua/Av. Lúcia Muniz (1° de Maio)"
                },
                {
                    "id": "500",
                    "nome": "Rua/Av. Joaquim Murtinho"
                },
                {
                    "id": "501",
                    "nome": "Rua/Av. Felipe dos Santos"
                },
                {
                    "id": "502",
                    "nome": "Rua/Av. Quintino Bocaiúva"
                },
                {
                    "id": "503",
                    "nome": "Praça Fátima"
                },
                {
                    "id": "504",
                    "nome": "Rua/Av. Antônio José Costa Ferreira"
                },
                {
                    "id": "505",
                    "nome": "Rua/Av. Safira"
                },
                {
                    "id": "506",
                    "nome": "Rua/Av. Jordânia"
                },
                {
                    "id": "507",
                    "nome": "Rua/Av. Joaíma"
                },
                {
                    "id": "508",
                    "nome": "Rua/Av. Geraldo Rocha (Via Pádua)"
                },
                {
                    "id": "509",
                    "nome": "Rua/Av. Princesa Isabel"
                },
                {
                    "id": "510",
                    "nome": "Rua/Av. Rodrigues da Cunha"
                },
                {
                    "id": "511",
                    "nome": "Rua/Av. Antônio José da Rocha"
                },
                {
                    "id": "512",
                    "nome": "Rua/Av. Marcelino Teonilo Gomes (Rua/Av. 4)"
                },
                {
                    "id": "513",
                    "nome": "Rodovia. BR - 040"
                },
                {
                    "id": "514",
                    "nome": "Rodovia. Vereador Joaquim Costa (VM5)"
                },
                {
                    "id": "515",
                    "nome": "Rua/Av. Dilson de Oliveira"
                },
                {
                    "id": "516",
                    "nome": "Rua/Av. Vasco Fernandes Coutinho"
                },
                {
                    "id": "517",
                    "nome": "Rua/Av. Dona Guilhermina"
                },
                {
                    "id": "521",
                    "nome": "Rua/Av. Esmeraldas"
                },
                {
                    "id": "522",
                    "nome": "Rua/Av. Opala"
                },
                {
                    "id": "523",
                    "nome": "Rua/Av. 21 de Abril"
                },
                {
                    "id": "524",
                    "nome": "Rua/Av. do Senado"
                },
                {
                    "id": "525",
                    "nome": "Rua/Av. Nova Lima"
                },
                {
                    "id": "526",
                    "nome": "Rua/Av. Santa Maria do Suassuí"
                },
                {
                    "id": "528",
                    "nome": "Rua/Av. Tibúrcio Custódio (Rua/Av. Leopoldina)"
                },
                {
                    "id": "529",
                    "nome": "Rua/Av. São Domingos"
                },
                {
                    "id": "530",
                    "nome": "Rua/Av. Dr. Arthur Hermeto"
                },
                {
                    "id": "531",
                    "nome": "Rua/Av. Maria Cecília"
                },
                {
                    "id": "532",
                    "nome": "Rua/Av. Pelotas"
                },
                {
                    "id": "533",
                    "nome": "Rua/Av. Arriconha"
                },
                {
                    "id": "534",
                    "nome": "Rua/Av. Antônio Bernardino Muniz"
                },
                {
                    "id": "535",
                    "nome": "Rua/Av. Riso do Prado"
                },
                {
                    "id": "536",
                    "nome": "Rua/Av. Paineiras"
                },
                {
                    "id": "537",
                    "nome": "Rua/Av. Ana Ribeiro"
                },
                {
                    "id": "538",
                    "nome": "Praça das Bandeiras"
                },
                {
                    "id": "539",
                    "nome": "Rua/Av. São João"
                },
                {
                    "id": "541",
                    "nome": "Rua/Av. Zulmerindo Ramires Brito (Rua/Av. 8)"
                },
                {
                    "id": "542",
                    "nome": "Rua/Av. Moema"
                },
                {
                    "id": "544",
                    "nome": "Praça Louis Ensch (Praça A)"
                },
                {
                    "id": "545",
                    "nome": "Rua/Av. Presidente Castelo Branco"
                },
                {
                    "id": "546",
                    "nome": "Rua/Av. Luninosa"
                },
                {
                    "id": "547",
                    "nome": "Rua/Av. Monsenhor Horta"
                },
                {
                    "id": "548",
                    "nome": "Rua/Av. Virgílio de Melo Franco"
                },
                {
                    "id": "549",
                    "nome": "Rua/Av. Senador Lúcio Bittencourt"
                },
                {
                    "id": "552",
                    "nome": "Rua/Av. Padre Viegas"
                },
                {
                    "id": "553",
                    "nome": "Rua/Av. Visconde de Ouro Preto"
                },
                {
                    "id": "554",
                    "nome": "Rua/Av. Dom João Santos"
                },
                {
                    "id": "555",
                    "nome": "Rua/Av. Tito Fulgêncio"
                },
                {
                    "id": "556",
                    "nome": "Rua/Av. São Sebastião"
                },
                {
                    "id": "557",
                    "nome": "Rua/Av. João XXIII"
                },
                {
                    "id": "558",
                    "nome": "Ruas das Paineiras"
                },
                {
                    "id": "559",
                    "nome": "Rua/Av. Acácias"
                },
                {
                    "id": "562",
                    "nome": "Rua/Av. Luz"
                },
                {
                    "id": "563",
                    "nome": "Praça Concórdia"
                },
                {
                    "id": "564",
                    "nome": "Rua/Av. Maria Bitencourt"
                },
                {
                    "id": "565",
                    "nome": "Rua/Av. laudelina Catorino"
                },
                {
                    "id": "566",
                    "nome": "Rua/Av. Conde do Bonfim"
                },
                {
                    "id": "567",
                    "nome": "Rua/Av. Monsenhor Guedes"
                },
                {
                    "id": "568",
                    "nome": "Rua/Av. das Estrelas"
                },
                {
                    "id": "569",
                    "nome": "Praça Estrela dAlva"
                },
                {
                    "id": "570",
                    "nome": "Rua/Av. do Luar"
                },
                {
                    "id": "571",
                    "nome": "Rua/Av. Guaxupé"
                },
                {
                    "id": "572",
                    "nome": "Rua/Av. Antônio Franscico Lisboa"
                },
                {
                    "id": "573",
                    "nome": "Rua/Av. R"
                },
                {
                    "id": "574",
                    "nome": "Rua/Av. K"
                },
                {
                    "id": "575",
                    "nome": "Rua/Av. Z"
                },
                {
                    "id": "576",
                    "nome": "Rua/Av. 21"
                },
                {
                    "id": "578",
                    "nome": "Rua/Av. Severino Ballesteros Rodrigues"
                },
                {
                    "id": "579",
                    "nome": "Rua/Av. Águas Marinhas"
                },
                {
                    "id": "580",
                    "nome": "Rua/Av. Alterosas"
                },
                {
                    "id": "581",
                    "nome": "Rua/Av. Eucalipto"
                },
                {
                    "id": "582",
                    "nome": "Rua/Av. Fênix"
                },
                {
                    "id": "583",
                    "nome": "Rua/Av. Rubi"
                },
                {
                    "id": "584",
                    "nome": "Rua/Av. B"
                },
                {
                    "id": "585",
                    "nome": "Rua/Av. Santos Dumont"
                },
                {
                    "id": "588",
                    "nome": "Rua/Av. 5"
                },
                {
                    "id": "589",
                    "nome": "Rodovia BR- 040"
                },
                {
                    "id": "591",
                    "nome": "Rua/Av. Diamante"
                },
                {
                    "id": "593",
                    "nome": "Rua/Av. Laudelina Castorino"
                },
                {
                    "id": "594",
                    "nome": "Rua/Av. Cruzeiro"
                },
                {
                    "id": "595",
                    "nome": "Rua/Av. Alto da Boa Vista"
                },
                {
                    "id": "596",
                    "nome": "Rua/Av. Cel. Olegário Leris"
                },
                {
                    "id": "597",
                    "nome": "Rua/Av. Durval Alves de Faria (Rua/Av. A)"
                },
                {
                    "id": "598",
                    "nome": "Rua/Av. Petrópolis"
                },
                {
                    "id": "599",
                    "nome": "Rua/Av. Itutinga"
                },
                {
                    "id": "600",
                    "nome": "Viaduto Simonésia"
                },
                {
                    "id": "601",
                    "nome": "Rua/Av. Refinaria Cubatão"
                },
                {
                    "id": "602",
                    "nome": "Rua/Av. da Benzina"
                },
                {
                    "id": "604",
                    "nome": "Rua/Av. do Oléo Diesel"
                },
                {
                    "id": "605",
                    "nome": "Rua/Av. Mato Grosso"
                },
                {
                    "id": "606",
                    "nome": "Rua/Av. Elza Fernandes Carneiro (PenetraçãoSete)"
                },
                {
                    "id": "607",
                    "nome": "Rua/Av. Vereador João Costa (Penetração Dois)"
                },
                {
                    "id": "608",
                    "nome": "Rodovia BR - 381"
                },
                {
                    "id": "609",
                    "nome": "Rua/Av. Dona Maria Augusta Belém"
                },
                {
                    "id": "610",
                    "nome": "Rua/Av. Domingos José Belém"
                },
                {
                    "id": "611",
                    "nome": "Rua/Av. Vista Alegre"
                },
                {
                    "id": "612",
                    "nome": "Rua/Av. Santa Sé"
                },
                {
                    "id": "613",
                    "nome": "Rua/Av. da Gaforina"
                },
                {
                    "id": "614",
                    "nome": "Rua/Av. Olhos dÁgua"
                },
                {
                    "id": "615",
                    "nome": "Rua/Av. 56"
                },
                {
                    "id": "616",
                    "nome": "Rua/Av. 51"
                },
                {
                    "id": "617",
                    "nome": "Rua/Av. 42"
                },
                {
                    "id": "618",
                    "nome": "Rua/Av. 43"
                },
                {
                    "id": "619",
                    "nome": "Rua/Av. B (Rua/Av. Tropical)"
                },
                {
                    "id": "621",
                    "nome": "Praça Tebas"
                },
                {
                    "id": "622",
                    "nome": "Rua/Av. Geremias Alves (Rua/Av. Gal. Durval de Barros)"
                },
                {
                    "id": "623",
                    "nome": "Rua/Av. Dona Judith de Morais E Barros"
                },
                {
                    "id": "624",
                    "nome": "Rua/Av. das Petúnias"
                },
                {
                    "id": "626",
                    "nome": "Rua/Av. Cel. Gabriel Capistrano"
                },
                {
                    "id": "627",
                    "nome": "Rua/Av. Juscelino Kubitscheck"
                },
                {
                    "id": "629",
                    "nome": "Rua/Av. Olinto Diniz"
                },
                {
                    "id": "630",
                    "nome": "Rua/Av. São Dimas"
                },
                {
                    "id": "631",
                    "nome": "Rua/Av. Padre José de Carvalho"
                },
                {
                    "id": "632",
                    "nome": "Rua/Av. Montevidéu"
                },
                {
                    "id": "633",
                    "nome": "Rua/Av. Vera Cruz"
                },
                {
                    "id": "634",
                    "nome": "Rua/Av. Beta"
                },
                {
                    "id": "635",
                    "nome": "Rua/Av. Alexandrina de Souza"
                },
                {
                    "id": "636",
                    "nome": "Rua/Av. Osvaldo Cruz"
                },
                {
                    "id": "637",
                    "nome": "Rua/Av. Minas Gerais"
                },
                {
                    "id": "638",
                    "nome": "Rua/Av. Jardim América"
                },
                {
                    "id": "639",
                    "nome": "Rua/Av. Garcia Rodrigues"
                },
                {
                    "id": "640",
                    "nome": "Rua/Av. Marilac"
                },
                {
                    "id": "641",
                    "nome": "Rua/Av. Padre Antônio Vieira"
                },
                {
                    "id": "642",
                    "nome": "Praça Nossa Senhora de Fátima"
                },
                {
                    "id": "643",
                    "nome": "Rua/Av. Vasco de Azevedo"
                },
                {
                    "id": "644",
                    "nome": "Rua/Av. das Paineiras"
                },
                {
                    "id": "645",
                    "nome": "Rua/Av. Francisco Firmo de Matos"
                },
                {
                    "id": "646",
                    "nome": "Carrefour"
                },
                {
                    "id": "647",
                    "nome": "Antiga Estrada de Ribeirão das Neves"
                },
                {
                    "id": "649",
                    "nome": "Rua/Av. 11"
                },
                {
                    "id": "650",
                    "nome": "Rua/Av. Dez"
                },
                {
                    "id": "651",
                    "nome": "Rua/Av. Perimetral"
                },
                {
                    "id": "652",
                    "nome": "Rua/Av. Robinson Barros Coelho"
                },
                {
                    "id": "653",
                    "nome": "Rua/Av. Valentim Costa Pacheco"
                },
                {
                    "id": "654",
                    "nome": "Rua/Av. Judith Naves de Lima"
                },
                {
                    "id": "655",
                    "nome": "Rua/Av. Zamiro Nelson de Souza"
                },
                {
                    "id": "656",
                    "nome": "Rua/Av. João Bosco Martins"
                },
                {
                    "id": "657",
                    "nome": "Rua/Av. Geraldo Januário de Araújo"
                },
                {
                    "id": "658",
                    "nome": "Rua/Av. Antônio Prado Melo"
                },
                {
                    "id": "659",
                    "nome": "Rua/Av. Gentil Diniz"
                },
                {
                    "id": "660",
                    "nome": "Rua/Av. Luiz Moreira"
                },
                {
                    "id": "661",
                    "nome": "Rua/Av. Natal Veronez"
                },
                {
                    "id": "662",
                    "nome": "Rua/Av. Manoel Pinheiro Diniz"
                },
                {
                    "id": "663",
                    "nome": "Rua/Av. Seis"
                },
                {
                    "id": "664",
                    "nome": "Rua/Av. Prof. Alves Horta"
                },
                {
                    "id": "665",
                    "nome": "Rua/Av. Aníbal Barca"
                },
                {
                    "id": "666",
                    "nome": "Rua/Av. José de Souza Arruda"
                },
                {
                    "id": "667",
                    "nome": "Rua/Av. Tomaz da Rocha Machado"
                },
                {
                    "id": "668",
                    "nome": "Rua/Av. Antônio Rodrigues Arzão"
                },
                {
                    "id": "669",
                    "nome": "Rua/Av. Vereador Joaquim Costa"
                },
                {
                    "id": "671",
                    "nome": "Rua/Av. Joviano Camargos"
                },
                {
                    "id": "672",
                    "nome": "Praça Presidente Tancredo Neves"
                },
                {
                    "id": "674",
                    "nome": "Rua/Av. Antônio Prado de Melo"
                },
                {
                    "id": "676",
                    "nome": "Rua/Av. Valentim da Costa Pacheco"
                },
                {
                    "id": "677",
                    "nome": "Rua/Av. Quaresmeiras"
                },
                {
                    "id": "678",
                    "nome": "Rua/Av. das Palmeiras"
                },
                {
                    "id": "679",
                    "nome": "Rua/Av. Ipê"
                },
                {
                    "id": "680",
                    "nome": "Rua/Av. Perobas"
                },
                {
                    "id": "681",
                    "nome": "Rua/Av. Mógno"
                },
                {
                    "id": "682",
                    "nome": "Rua/Av. Jacarandá"
                },
                {
                    "id": "683",
                    "nome": "Rua/Av. Mangueiras"
                },
                {
                    "id": "684",
                    "nome": "Rua/Av. Hermes da Fonseca"
                },
                {
                    "id": "687",
                    "nome": "Gal. David Sarnoff"
                },
                {
                    "id": "688",
                    "nome": "Rua/Av. Pinho"
                },
                {
                    "id": "689",
                    "nome": "Rua/Av. das Quaresmeiras"
                },
                {
                    "id": "690",
                    "nome": "Rua/Av. 137"
                },
                {
                    "id": "692",
                    "nome": "Praça Antônio Mourão Guimaraes (Praça da CEMIG)"
                },
                {
                    "id": "693",
                    "nome": "Alça de acesso à Via Expressa"
                },
                {
                    "id": "699",
                    "nome": "Rua/Av. das Araras"
                },
                {
                    "id": "700",
                    "nome": "Rua/Av. dos Melros"
                },
                {
                    "id": "701",
                    "nome": "Rua/Av. das Garças"
                },
                {
                    "id": "702",
                    "nome": "Est Chico Mendes"
                },
                {
                    "id": "703",
                    "nome": "Rua/Av. Jaguará"
                },
                {
                    "id": "704",
                    "nome": "Praça Nossa Senhora da Conceição"
                },
                {
                    "id": "705",
                    "nome": "Rua/Av. Dr. Cincinato Cajado Braga"
                },
                {
                    "id": "706",
                    "nome": "Rua/Av. Dr. Cncinato Cajado da Conceição"
                },
                {
                    "id": "707",
                    "nome": "Rua/Av. Sócrates Mariani Bittencourt"
                },
                {
                    "id": "708",
                    "nome": "Praça da Delp"
                },
                {
                    "id": "709",
                    "nome": "Rua/Av. Rio São Francisco"
                },
                {
                    "id": "711",
                    "nome": "Rua/Av. Trieste"
                },
                {
                    "id": "712",
                    "nome": "Rua/Av. Rio Urucuia"
                },
                {
                    "id": "713",
                    "nome": "Rua/Av. Rio Verde"
                },
                {
                    "id": "714",
                    "nome": "Rua/Av. Rio Paraopeba"
                },
                {
                    "id": "715",
                    "nome": "Rua/Av. Lino de Moro"
                },
                {
                    "id": "716",
                    "nome": "Rua/Av. João Wanderley"
                },
                {
                    "id": "717",
                    "nome": "Rua/Av. Antônio de Pádua Pinto(Rua/Av. 4)"
                },
                {
                    "id": "719",
                    "nome": "Rua/Av. Geraldo Januário da Silva"
                },
                {
                    "id": "721",
                    "nome": "Rua/Av. Ligação Um"
                },
                {
                    "id": "722",
                    "nome": "Rua/Av. Caiapó"
                },
                {
                    "id": "723",
                    "nome": "Rua/Av. José Afonso Barbosa Melo"
                },
                {
                    "id": "724",
                    "nome": "Viaduto da Hípica"
                },
                {
                    "id": "726",
                    "nome": "Praça Raimunda Rodrigues Magela(Praça Mercado)"
                },
                {
                    "id": "727",
                    "nome": "Travessa B-2"
                },
                {
                    "id": "728",
                    "nome": "Rua/Av. Buganvile"
                },
                {
                    "id": "729",
                    "nome": "Rua/Av. Riso Prado"
                },
                {
                    "id": "731",
                    "nome": "Rua/Av. Arminda dos Reis"
                },
                {
                    "id": "732",
                    "nome": "Rua/Av. Manoel Moreira"
                },
                {
                    "id": "734",
                    "nome": "Rua/Av. Gabriel Capistrano"
                },
                {
                    "id": "735",
                    "nome": "Rua/Av. das Flores"
                },
                {
                    "id": "736",
                    "nome": "Rua/Av. Flor de Cactos"
                },
                {
                    "id": "737",
                    "nome": "Rua/Av. Francisco Almeida Melo"
                },
                {
                    "id": "738",
                    "nome": "Rua/Av. Antônio de Oliveira Campos"
                },
                {
                    "id": "739",
                    "nome": "Rua/Av. Lunard Vianna Dolabella"
                },
                {
                    "id": "740",
                    "nome": "Rua/Av. Humberto Antoniazzi"
                },
                {
                    "id": "741",
                    "nome": "Rua/Av. Geraldo de Souza Meireles"
                },
                {
                    "id": "742",
                    "nome": "Rua/Av. Felisbino Pinto Monteiro"
                },
                {
                    "id": "743",
                    "nome": "Rua/Av. Mal. Hermes da Fonseca"
                },
                {
                    "id": "744",
                    "nome": "Alça de Acesso à Rua/Av. Babita Camargos"
                },
                {
                    "id": "745",
                    "nome": "Alameda Flor de Cactos"
                },
                {
                    "id": "746",
                    "nome": "Rua/Av. Levi Diniz Costa"
                },
                {
                    "id": "748",
                    "nome": "Praça Antônio Mourão Guimarães (Praça CEMIG)"
                },
                {
                    "id": "751",
                    "nome": "Rua/Av. VL33"
                },
                {
                    "id": "752",
                    "nome": "Rua/Av. José Bernardino Neto (Rua/Av. Servidão 1)"
                },
                {
                    "id": "753",
                    "nome": "Rua/Av. das Clarinetas (Rua/Av. Servidão 6)"
                },
                {
                    "id": "754",
                    "nome": "Rua/Av. dos Trombones (Rua/Av. Servidão 7)"
                },
                {
                    "id": "755",
                    "nome": "Rua/Av. das Flautas (Rua/Av. Servidão 9)"
                },
                {
                    "id": "756",
                    "nome": "Rua/Av. dos Pianos (Rua/Av. Servidão 8)"
                },
                {
                    "id": "757",
                    "nome": "Rua/Av. dos Violinos (Rua/Av. Servidão 5)"
                },
                {
                    "id": "758",
                    "nome": "Rua/Av. José Bernardino Neto (Rua/Av. Servidão 1A)"
                },
                {
                    "id": "759",
                    "nome": "Rua/Av. dos Trompetes (Rua/Av. 1)"
                },
                {
                    "id": "760",
                    "nome": "Rua/Av. 85"
                },
                {
                    "id": "761",
                    "nome": "Rua/Av. 82"
                },
                {
                    "id": "762",
                    "nome": "Viaduto do Tropical"
                },
                {
                    "id": "763",
                    "nome": "Rua/Av. Do Benzol"
                },
                {
                    "id": "764",
                    "nome": "Rua/Av. Refinaria Gabriel Passos"
                },
                {
                    "id": "765",
                    "nome": "Rua/Av. Parafina"
                },
                {
                    "id": "766",
                    "nome": "Rua/Av. José Rodrigues Guilherme (Fonte Grande)"
                },
                {
                    "id": "767",
                    "nome": "Rua/Av. Petróleo"
                },
                {
                    "id": "768",
                    "nome": "Rua/Av. Betume"
                },
                {
                    "id": "769",
                    "nome": "Rua/Av. Benjamin Camargos"
                },
                {
                    "id": "770",
                    "nome": "Rua/Av. Levi Diniz Costa (Rua/Av. 2)"
                },
                {
                    "id": "771",
                    "nome": "Ponte"
                },
                {
                    "id": "772",
                    "nome": "Rua/Av. Manoel Jacinto Coelho Junior"
                },
                {
                    "id": "773",
                    "nome": "Via Municipal Vereador Joaquim Costa"
                },
                {
                    "id": "774",
                    "nome": "Rua/Av. Treze"
                },
                {
                    "id": "775",
                    "nome": "Rua/Av. Agopiara"
                },
                {
                    "id": "776",
                    "nome": "Rua/Av. Ademar dos Santos Barbosa"
                },
                {
                    "id": "777",
                    "nome": "Rua/Av. Maria de Lourdes Frias (Rua/Av. 1)"
                },
                {
                    "id": "778",
                    "nome": "Rua/Av. Albert Schwattzer"
                },
                {
                    "id": "781",
                    "nome": "Rua/Av. Mantiqueira"
                },
                {
                    "id": "782",
                    "nome": "Rua/Av. Colúmbia"
                },
                {
                    "id": "783",
                    "nome": "Rua/Av. Cel. Murta"
                },
                {
                    "id": "784",
                    "nome": "Rua/Av. Barroso"
                },
                {
                    "id": "785",
                    "nome": "Praça SD"
                },
                {
                    "id": "786",
                    "nome": "Rua/Av. João Soares"
                },
                {
                    "id": "787",
                    "nome": "Rua/Av. João Menezes Soares"
                },
                {
                    "id": "788",
                    "nome": "Rua/Av. Sofia de Menezes"
                },
                {
                    "id": "789",
                    "nome": "Rua/Av. Maria Soares Chaves"
                },
                {
                    "id": "790",
                    "nome": "Rua/Av. Orlando Lima Melo"
                },
                {
                    "id": "791",
                    "nome": "Rua/Av. Tancredo Neves"
                },
                {
                    "id": "792",
                    "nome": "Rua/Av. Neblina"
                },
                {
                    "id": "793",
                    "nome": "Rua/Av. Búzios"
                },
                {
                    "id": "794",
                    "nome": "Praça Estrela DAlva"
                },
                {
                    "id": "795",
                    "nome": "Rua/Av. Arpoador"
                },
                {
                    "id": "796",
                    "nome": "Rua/Av. Niterói"
                },
                {
                    "id": "797",
                    "nome": "Rua/Av. Ubatuba"
                },
                {
                    "id": "798",
                    "nome": "Rua/Av. Piatã"
                },
                {
                    "id": "799",
                    "nome": "Rua/Av. Gravatã"
                },
                {
                    "id": "800",
                    "nome": "Rua/Av. Verbo Divino (Rua/Av. Hum)"
                },
                {
                    "id": "801",
                    "nome": "Rodovia BR 040"
                },
                {
                    "id": "802",
                    "nome": "Viaduto Beatriz"
                },
                {
                    "id": "803",
                    "nome": "Rua/Av. Osório de Moraes"
                },
                {
                    "id": "805",
                    "nome": "Rua/Av. Palamares"
                },
                {
                    "id": "806",
                    "nome": "Rua/Av. Eugênio Nápoli"
                },
                {
                    "id": "809",
                    "nome": "Retorno após Rua/Av. Arquiteto Morandi"
                },
                {
                    "id": "812",
                    "nome": "Rua/Av. 8"
                },
                {
                    "id": "813",
                    "nome": "Marginal BR 381"
                },
                {
                    "id": "814",
                    "nome": "Rua/Av. S, Rua/Av. Rio Comprido"
                },
                {
                    "id": "815",
                    "nome": "Rua/Av. Oliver M. Thompson"
                },
                {
                    "id": "816",
                    "nome": "Rua/Av. Bethoven"
                },
                {
                    "id": "817",
                    "nome": "Rua/Av. Albert Shwaizer"
                },
                {
                    "id": "819",
                    "nome": "Rua/Av. Jequitibás- Metrô"
                },
                {
                    "id": "820",
                    "nome": "Rua/Av. Diácono Alair Henrique de Oliveira (Rua/Av. 1)"
                },
                {
                    "id": "821",
                    "nome": "Rua/Av. Gal. Eugênio Pacelli"
                },
                {
                    "id": "822",
                    "nome": "Rua/Av. Cassiano Dornas"
                },
                {
                    "id": "823",
                    "nome": "Rua/Av. Augusta Gonçalves Nogueira"
                },
                {
                    "id": "824",
                    "nome": "Praça Itaperuna"
                },
                {
                    "id": "826",
                    "nome": "Rua/Av. Paraibuna"
                },
                {
                    "id": "827",
                    "nome": "Adutora Várzea das Flores"
                },
                {
                    "id": "828",
                    "nome": "Rua/Av. 06"
                },
                {
                    "id": "829",
                    "nome": "Rua/Av. Padre Francisco Juarez"
                },
                {
                    "id": "830",
                    "nome": "Rua/Av. Professor Alves Horta"
                },
                {
                    "id": "831",
                    "nome": "Rua/Av. A (Rua/Av. Luiz Moreira)"
                },
                {
                    "id": "832",
                    "nome": "Rua/Av. José Geraldo da Silva"
                },
                {
                    "id": "833",
                    "nome": "Rua/Av. Geraldo Januário Araújo"
                },
                {
                    "id": "834",
                    "nome": "Rua/Av. Pará de Minas"
                },
                {
                    "id": "835",
                    "nome": "Rua/Av. Diamantina"
                },
                {
                    "id": "836",
                    "nome": "Rua/Av. Cambuquira"
                },
                {
                    "id": "837",
                    "nome": "Rua/Av. Para de Minas"
                },
                {
                    "id": "838",
                    "nome": "Praça Antônio Mourão Guimaraes (Praça de CEMIG)"
                },
                {
                    "id": "839",
                    "nome": "Rua/Av. Antônio Mattos Pinho"
                },
                {
                    "id": "840",
                    "nome": "Rua/Av. Olívia de Oliveira Costa"
                },
                {
                    "id": "841",
                    "nome": "Rua/Av. Hercílio Gomes da Silveira"
                },
                {
                    "id": "842",
                    "nome": "Rua/Av. Milton Alves do Vale (Rua/Av. VC4)"
                },
                {
                    "id": "845",
                    "nome": "Rua/Av. Capitão Antônio José da Paixão"
                },
                {
                    "id": "846",
                    "nome": "Rua/Av. Antônio de Mattos Pinho"
                },
                {
                    "id": "847",
                    "nome": "Rua/Av. José Soares da Costa Neto"
                },
                {
                    "id": "849",
                    "nome": "Rua/Av. Avelino Hilário Muniz"
                },
                {
                    "id": "850",
                    "nome": "Rua/Av. Sem Nome"
                },
                {
                    "id": "851",
                    "nome": "Rua/Av. Maxixe"
                },
                {
                    "id": "852",
                    "nome": "Rua/Av. SD559"
                },
                {
                    "id": "853",
                    "nome": "Rua/Av. Comunidade"
                },
                {
                    "id": "854",
                    "nome": "Rua/Av. Vinte e Nove"
                },
                {
                    "id": "855",
                    "nome": "Rua/Av. Rosineiry de Souza Arruda"
                },
                {
                    "id": "856",
                    "nome": "Rua/Av. Dezenove"
                },
                {
                    "id": "859",
                    "nome": "Rua/Av. Paulo César de Mendonça"
                },
                {
                    "id": "861",
                    "nome": "Rua/Av. Henriqueta Mendonça Rigolon"
                },
                {
                    "id": "863",
                    "nome": "Rua/Av. Romualdo José da Silva"
                },
                {
                    "id": "864",
                    "nome": "Rua/Av. Chopin"
                },
                {
                    "id": "865",
                    "nome": "Alameda dos Rouxinóis"
                },
                {
                    "id": "867",
                    "nome": "Rodovia. BR 040"
                },
                {
                    "id": "869",
                    "nome": "Rua/Av. Silval Alves da Cunha"
                },
                {
                    "id": "872",
                    "nome": "Rua/Av. Almenara"
                },
                {
                    "id": "873",
                    "nome": "Rua/Av. 3"
                },
                {
                    "id": "879",
                    "nome": "Rua/Av. Salvador Cosso"
                },
                {
                    "id": "882",
                    "nome": "Rua/Av. VC 2"
                },
                {
                    "id": "883",
                    "nome": "Rua/Av. Registro"
                },
                {
                    "id": "884",
                    "nome": "Rua/Av. João da Mata"
                },
                {
                    "id": "885",
                    "nome": "Rua/Av. Getúlio Vargas"
                }
            ]
        }
    ][0]
}