import config from 'config';
import api from 'api';
const sdk = api('@eden-ai/v2.0#znw2537nli2xig1o');

class SDK {
    constructor(token) {
       sdk.auth(token);
       this.sdk = sdk;
    }

    getSuccessSpeech(speeches) {
        const successfullySpeeches = Object.entries(speeches).reduce((acc, [name, value]) => {
            if (value.status === 'success' && value.audio_resource_url) {
                name === 'amazon' ? acc[0] = value.audio_resource_url : acc.push(value.audio_resource_url);
                return acc;
            }
            return acc;
        }, []);

        return successfullySpeeches[0];
    }

    async textToSpeech(message) {
        try {
            const response = await this.sdk.audio_text_to_speech_create({
                response_as_dict: true,
                attributes_as_list: false,
                show_original_response: false,
                rate: 0,
                pitch: 0,
                volume: 0,
                sampling_rate: 0,
                providers: 'google,microsoft,lovoai,ibm,amazon',
                language: 'ru',
                text: message,
                option: 'FEMALE',
                audio_format: 'mp3'
            });
            return this.getSuccessSpeech(response.data);
        } catch (e) {
            console.log('Ошибка при конвертации текста в речь', e.message);
        }

    }
}

export const sdk_instance = new SDK(config.get('SDK_TOKEN'));