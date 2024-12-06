const { generatorQRCode } = require('./src/qrGenerator');
const inquirer = require('inquirer');

async function main() {
    try {
        const {text} = await inquirer.prompt([
            {
                type: 'input',
                name: 'text',
                message: 'Enter text/URL for QR code generation:',
                validate: input => input.trim() !== ''
            }
        ]);

        await generateQRCode(text);
    } catch (error) {
        console.error('QR code generation failed:', error);
    }
}

main();

const QRCode = require('qrcode');
const path = require('path');
constfs = require('fs');