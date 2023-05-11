import axios from 'axios';
import { createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import {removeFile} from "./utils.js";

class OggConverter {
    constructor() {
        ffmpeg.setFfmpegPath(installer.path)
    }

    toMp3(input, output) {
        try {
            const outputPath = resolve(dirname(input), `${output}.mp3`);
            return new Promise((resolve, reject) => {
                ffmpeg(input).
                inputOptions('-t 30').
                output(outputPath).
                on('end', () => {
                    removeFile(input);
                    resolve(outputPath);
                }).
                on('error', (err) => reject(err.message)).
                run();
            })
        } catch (e) {
            console.log('Error while converting', e.message)
        }
    }

    async create(url, filename) {
        try {
            const oggPath = resolve(process.cwd(), './voices', `${filename}.ogg`)
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream',
            });
            return new Promise((resolve) => {
                const stream = createWriteStream(oggPath);
                response.data.pipe(stream);
                stream.on('finish', () => resolve(oggPath))
            })
        } catch (e) {
            console.log('Error while creating ogg', e.message)
        }
    }

}

export const ogg = new OggConverter()