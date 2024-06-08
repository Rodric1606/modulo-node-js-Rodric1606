import fs from 'fs';
import readline from 'readline';
import { EventEmitter } from 'events';
import inquirer from 'inquirer';


class ProcessarArquivo extends EventEmitter{
    async lerArquivo(origemArquivo){
                
        if (!fs.existsSync(origemArquivo)) {
            throw new Error(`O arquivo "${origemArquivo}" não existe.`);
        }
                        
        const arquivo = fs.createReadStream(origemArquivo);
        const leituraArquivo = readline.createInterface({
            input: arquivo,
            crlDelay: Infinity
        });

        let numSoma = 0;
        let contarLinhaTexto = 0;
        const dtInicio = Date.now();

        for await (const linha of leituraArquivo){
            if(/^\+$/.test(linha.trim())){

                numSoma += parseInt(linha.trim(),10);
                
            }else if(linha.trim().length > 0){
                contarLinhaTexto++;
            }
        }
        const dtConclusao = Date.now();
        const tpExecuta = (dtConclusao - dtInicio)/ 1000;

        this.emit('resumo', {
            numSoma,
            contarLinhaTexto,
            tpExecuta
        });
    }
}
async function verificarArquivo() {
        const resposta = await inquirer.prompt([
            {
                type: 'input',
                name: 'origemArquivo',
                message: 'Informe o caminho do arquivo: '
            }
        ]);
        return resposta.origemArquivo;
}

async function verificarNovamente(){
    const resposta = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'retry',
            message: 'Deseja executar novamente?'
        }
    ]);
    return resposta.retry;
}

async function main(){
    const processaArquivo = new ProcessarArquivo();

    processaArquivo.on('resumo', ({numSoma, contarLinhaTexto, tpExecuta}) => {
        console.log(`Soma dos números: ${numSoma}`);
        console.log(`linhas com texto: ${contarLinhaTexto}`);
        console.log(`Tempo de execução: ${tpExecuta} segundos`);
    });

    while(true){
        const origemArquivo = await verificarArquivo();
        await processaArquivo.lerArquivo(origemArquivo);

        const retry = await verificarNovamente();
        if(!retry) break;
    }
}

main().catch(err => console.error(err));