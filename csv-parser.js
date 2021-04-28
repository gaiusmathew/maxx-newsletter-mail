const fs = require("fs-extra");
const path = require("path");
const parse = require("csv-parse");

module.exports = class CsvParser {
    csvParserOptions = {
        trim: true,
        relax_column_count: true,
    };

    async importCsvFile(fileName) {
        let demoCsv = path.join(__dirname, `sample-data/${fileName}`);
        const fileContent = await fs.createReadStream(demoCsv, "utf-8");

        return this.doParseData(fileContent);
    }

    async doParseData(fileContent) {
        return new Promise((resolve, reject) => {
            const parser = parse(this.csvParserOptions);
            const records = [];

            // 1. Read parser
            fileContent.pipe(parser);
            parser.on("readable", () => {
                let record;

                while ((record = parser.read())) {
                    records.push(record);
                }
            });
            parser.on("error", reject);
            parser.on("end", async () => {
                // 2. On completing reading csv, format data according to our requirement
                const headerRow = records[0];
                const restData = records.slice(1);

                let completeNewsLetters = [];
                let newsLetterData = {};

                // Loop through rest of csv data and match it with corresponding head title
                for (let newsLetter of restData) {
                    newsLetter.forEach((singleNews, index) => {
                        newsLetterData = {
                            ...newsLetterData,
                            [`${headerRow[index]}`]: singleNews,
                        };
                    });
                    completeNewsLetters.push(newsLetterData);
                }

                resolve({
                    completeNewsLetters,
                });
            });
        });
    }
};
