import express from "express";
import cors from 'cors';
import fs from 'fs';
import parse from 'csv-parser';
import Intl from 'intl';

const app = express();

app.use(cors({
    origin: '*'
}));

app.use(express.json());

app.get('/csv-converter', async (req, res) => {
    try {
        const objArray = [];
        fs.createReadStream("./data.csv")
            .pipe(parse({
                delimiter: ",",
                from_line: 2
            }))
            .on("data", function (row) {
                row = convertToCurrency(row);
                row.validCpfCnpj = checkCPFCNPJ(row.nrCpfCnpj);
                objArray.push(row);
            })
            .on("error", function (error) {
                res.status(500).json({
                    message: error.message
                });
            })
            .on("end", function () {
                res.send(JSON.stringify(objArray));
            });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

function convertToCurrency(row) {
    const formCurrency = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    })
    row.vlTotal = formCurrency.format(row.vlTotal);
    row.vlPresta = formCurrency.format(row.vlPresta);
    row.vlMora = formCurrency.format(row.vlMora);
    row.vlAtual = formCurrency.format(row.vlAtual);
    row.vlMulta = formCurrency.format(row.vlMulta);
    row.vlOutAcr = formCurrency.format(row.vlOutAcr);
    row.vlIof = formCurrency.format(row.vlIof);
    row.vlDescon = formCurrency.format(row.vlDescon);

    return row;
}

function checkCPFCNPJ(cpfCnpj) {
    const onlyDigits = cpfCnpj.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (onlyDigits.length === 11) {
        return validateCPF(onlyDigits);
    } else if (onlyDigits.length === 14) {
        return validateCNPJ(onlyDigits);
    } else {
        return false; // Retornar falso se não for nem CPF nem CNPJ válido
    }
}

function validateCPF(cpf) {
    const cpfRegex = /^\d{11}$/;
    return cpfRegex.test(cpf);
}

function validateCNPJ(cnpj) {
    const cnpjRegex = /^\d{14}$/;
    return cnpjRegex.test(cnpj);
}

const port = process.env.PORT || "4000";

app.listen(port, () => {
    console.log(`Server Running at ${port} 🚀`);
});