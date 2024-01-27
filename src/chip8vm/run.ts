import * as fs from 'fs';
import {Chip8VM} from './vm';
import readline from 'readline';
import { exit } from 'process';

const filePath = './rom.ch8';

try {
    const fileContent = fs.readFileSync(filePath);
    const romData = new Uint8Array(fileContent);
    console.log(romData);
    exit(0);

    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });

    // rl.on('line', (input) => {
    //     switch(input){

    //     }

    //     vm.handleKeyPress();
    // });

    
    let vm = new Chip8VM();
    vm.loadFont();
    vm.loadRom(romData);
    vm.executeProgram();
} catch (error) {
    console.error(`Error reading file: ${error}`);
}
