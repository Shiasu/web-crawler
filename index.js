const fs = require("fs");
const cheerio = require("cheerio");
const Nightmare = require("nightmare");

//Адрес сайта на котором производится поиск (выбран для примера).
const url = "https://synapsenet.ru/searchorganization/proverka-kontragentov";

//Массив ИНН организаций по которым производится поиск (выбраны для примера)
let arrOfNums = [7707083893, 7727092744, 7722093624, 8606011076];

let data = [];

/*Функция получения данных с уже загруженной(итоговой) страницы.
  Cheerio позволяет производить поиск и выбор по селекторам/тегам аналогично JQuery.
  В случае изменения исходного сайта необходимы изменения здесь.
*/
let getData = html => {
	const $ = cheerio.load(html);
	const org = $("#org-full-header div h1").text();
	const inn = $(".of-common-data:nth-of-type(2) .ofcd-requisites li:nth-child(2)").text();
	$(".org-full-contacts .ofc-block:nth-child(2)").each((i, elem) => {
		const telNums = [];
		const mails = [];

		$(elem).find(".ofc-phones div").each(function(i, elem) {
			telNums[i] = $(this).text();
		});
		$(elem).find(".ofc-emails div").each(function(i, elem) {
			mails[i] = $(this).text();
		});
		data.push({
			Organization: org,
			Org_INN: inn,
			Telephone: {...telNums},
			Mail: {...mails}
		});
	});
	return data;
};

/*Функция запускающая браузер nigthmare и выполняющая необходимые действия на странице.
  В случе успешной загрузки страницы и выполнения действий запишет результат в файл.
  В противном случае выкинет ошибку в консоль.
  В случае изменения исходного сайта необходимы изменения здесь.
  *Для отображения браузера необходимо изменить параметр show.
  **Параметр waitTimeout позволяет установить время ожидания загрузки страницы до выбрасывания ошибки.
*/
const getOrgContacts = async orgNum => {
	console.log(`Now checking ${orgNum}`);
	const nightmare =  new Nightmare({ show: false, waitTimeout: 10000 });

	try {
		await nightmare
			.goto(url)
			.wait("body")
			.type("#org-search-input", orgNum)
			.click("#org-search-button")
			.wait("#org-wrapper")
			.evaluate(() => document.querySelector("#org-wrapper").innerHTML)
			.end()
		.then(response => {
			fs.writeFileSync("result.json", JSON.stringify(getData(response), null, "\t"));
		}).catch(err => {
			console.log(err);
		});
	} catch(e) {
		console.error(e);
	}
};

//Создание очереди на массиве, позволяет поочередно запускать обработчик
//дожидаясь конца работы предыдущей итерации.
const series = arrOfNums.reduce(async (queue, number) => {
	const dataArray = await queue;
	dataArray.push(await getOrgContacts(number));
	return dataArray;
}, Promise.resolve([]));