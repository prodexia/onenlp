$().ready(function () {
	$('.tab-title>a').click(function (e) {
		e.preventDefault();
		var index = $(this).parent().index();
		$(this).parent().addClass('active')
			.siblings().removeClass('active')
			.parent('ul.tabs').siblings('.tabs-content').children('.content').removeClass('active')
			.eq(index).addClass('active');
	});
})
//   document.addEventListener("DOMContentLoaded", function (e) {
// 	document.querySelector(".tab-title > a").onclick = (e) => {
// 		e.preventDefault();
// 		var index = document.querySelector(".tab-title > a").parent().index();
// 		document.querySelector(".tab-title > a").parent().addClass('active')
// 			.siblings().removeClass('active')
// 			.parent('ul.tabs').siblings('.tabs-content').children('.content').removeClass('active')
// 			.eq(index).addClass('active');
// 	}
// });

window.onload = function () {
	var anim = document.querySelector("#anim")
	var hints = document.querySelector("#tooltips")

	// Here's the all logic behind settings
	// We are checking if there is some Key stored in localStorage if, no then we sets the defaults values in localStorage
	if (localStorage.getItem("anim") === null) {
		localStorage.setItem(document.querySelector("#anim").id, document.querySelector("#anim").checked);
	}

	if (localStorage.getItem("tooltips") === null) {
		localStorage.setItem(document.querySelector("#tooltips").id, document.querySelector("#tooltips").checked);
	}

	anim.checked = JSON.parse(localStorage.getItem(anim.id));

	if (!anim.checked) {
		document.querySelector("#header").classList.remove("slideIn");
		document.querySelector("#dis-target").classList.remove("scaleIn");
		document.querySelector("#tools-nav").classList.remove("bottomfade");
	}

	hints.checked = JSON.parse(localStorage.getItem(hints.id));

	// If yes , that is tips are checked then we sets tooltoops to all targetted svgs so that it will help user get an idea
	if (hints.checked) {
		// All tool tips
		tippy('#tip-opp', {
			content: 'Get the opposite word.',
		});
		tippy('#tip-entity', {
			content: 'Perdorm Named Entity Recognition.',
		});
		tippy('#tip-usage', {
			content: 'Get the usage of a selected word.',
		});
		tippy('#tip-define', {
			content: 'Get the meaning of the word.',
		});
		tippy('#tip-sentiment', {
			content: 'Perform sentiment analysis.',
		});
		tippy('#tip-active-passive', {
			content: 'Switch the voice from active to passive & vice-verca.',
		});

		tippy('#tip-keep', {
			content: 'Keep the previous dependencies img when generating a new one.',
		});
		tippy('#tip-settings', {
			content: 'Customize nlpshala according to your needs.',
		});
		tippy('#tip-save', {
			content: 'Create a snippet and use it later!',
		});
	}
}


// =================== Main Settings =====================
var text = document.querySelector("#input_text");
var process_btn = document.querySelector("#process_it");
var in_del = document.querySelector("#in_del");
var out_del = document.querySelector("#out_del");
var segment_main = document.querySelector("#segment-main");
var copy_output = document.querySelector("#copy_output");

// download output text 
var save_output = document.querySelector("#save_output");
// var output_text = document.querySelector("#segment-main");


// The json objects to store data from fetch requests
var segments = {};
var props = {}

document.querySelector("#settings").onclick = () => {
	document.querySelector("#settings-pop").style.display = "block";
}

document.querySelector("#nlp-pop-close").onclick = () => {
	document.querySelector("#settings-pop").style.display = "none";
}

// ========================= Main Processing ===============
process_btn.onclick = function () {
	var url = _home_ + "?text=" + encodeURIComponent(text.textContent);
	fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		})
		.then((response) => response.json())
		.then((data) => {
			segments = data;

			// Pre defined functions 
			update_sentences()
			build_segments()
			get_common_words()
			get_pos()
			preprocess_dependency()
			update_chart()
		})
		.catch((error) => {
			console.log("Error:", error);
		});
}


// ============ Editor Top Functions ================
function get_sentiment() {
	var url = _sentiment_ + "?text=" + encodeURIComponent(text.textContent);
	fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		})
		.then((response) => response.json())
		.then((data) => {
			console.log("data['sentiment']")

			document.querySelector("#popm").style.display = "block";
			document.querySelector("#pop-h").textContent = "Sentiment Analysis"
			document.querySelector("#pop-desc").textContent = data["sentiment"];
		})
		.catch((error) => {
			console.log("Error:", error);
		});
}


// ============ Editor Functions ================
var sentence_counts = document.querySelector("#sentence_counts");
var character_counts = document.querySelector("#character_counts");

document.querySelector("#pop-close").onclick = () => {
	document.querySelector("#popm").style.display = 'none';
}

function update_sentences() {
	sentence_counts.innerHTML = `<span><b>${segments["sent_count"]}</b> Sentences</span>`;
}

document.body.onkeyup = (e) => {
	character_counts.innerHTML = document.querySelector("#input_text").innerText.length + "/600 Characters";
}

in_del.onclick = () => {
	text.innerHTML = "";
}

out_del.onclick = () => {
	segment_main.innerHTML = "";
}

copy_output.onclick = () => {
	copy_var(get_output_text())
}


// ============= MOST COMMON WORDS =================
var reload_mcw = document.querySelector("#reload_mcw");
var mcw_tags = document.querySelector("#mcw_tags");
reload_mcw.onclick = () => {
	mcw_tags.innerHTML = "";
	get_common_words()
}
// typr --->            <span class="block">happy</span>
// load more btn 
var load_mcw = document.querySelector("#load_mcw");
var copy_mcw = document.querySelector("#copy_mcw");
load_mcw.onclick = () => {
	get_common_words(more = true)
}

copy_mcw.onclick = () => {
	console.log(mcw_tags.textContent)
	copy_var()
	showToast(mcw_tags.textContent)
}

function get_common_words() {
	var mcw = segments['mcw']
	mcw_tags.innerHTML = "";

	for (let i of mcw) {
		var span = document.createElement('span');
		span.className = `block`;
		span.innerHTML += `${i}`;
		mcw_tags.appendChild(span);
	}
}


// ============= Parts Of Speech ============
function get_pos() {
	var noun = document.querySelector("#noun")
	var verb = document.querySelector("#verb")
	var adverb = document.querySelector("#adverb")
	var all_pos = document.querySelector("#posmagic")

	noun.innerHTML = "";
	verb.innerHTML = "";
	adverb.innerHTML = "";
	all_pos.innerHTML = "";


	for (let i of segments['pos']['noun']) {
		noun.innerHTML += `<b>${i} </b>,`;
	}

	for (let i of segments['pos']['verb']) {
		verb.innerHTML += `<b>${i} </b>,`;
	}

	for (let i of segments['pos']['adverb']) {
		adverb.innerHTML += `<b>${i} </b>,`;
	}

	for (let i of segments['pos']['all_pos']) {
		all_pos.innerHTML += `<b>${i} </b>,`;
	}
}


// ============== MISSELANOUS ====================
var summary_output = document.querySelector("#summary_output");
var summary_generate = document.querySelector("#summary_generate");
var ph_extract = document.querySelector("#ph_extract");
var dependency_generate = document.querySelector("#dependency_generate");


function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

// Start file download.
document.getElementById("save_output").addEventListener("click", function () {
	var text = document.querySelector("#segment-main").textContent;
	var filename = "NLPShala-ouput.txt";

	download(filename, text);
}, false);


summary_generate.onclick = () => {
	generate_summary()
}

ph_extract.onclick = () => {
	var phrases = eval(input1.value);
	var url = _phraserMatcher_ + "?text=" + encodeURIComponent(text.textContent) + "&patterns=" + encodeURIComponent(input1.value);
	fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		})
		.then((response) => response.json())
		.then((data) => {
			var summ = data["matched_phrases"];
			console.log(summ)
			// phrases_output
		})
		.catch((error) => {
			console.log("Error:", error);
		});
}

dependency_generate.onclick = () => {
	var val = document.querySelector("#sel-sents").value;
	generate_dependency(val)
}

function generate_summary() {
	var url = _summary_ + "?text=" + encodeURIComponent(text.textContent);
	fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		})
		.then((response) => response.json())
		.then((data) => {
			var summ = data["summary"];
			summary_output.innerHTML = `<p>${summ}</p>`;
		})
		.catch((error) => {
			console.log("Error:", error);
		});
}


// === Extracting sentences from base fetch that are sentences ===
function preprocess_dependency() {
	var sents = segments["sentences"]
	let arr = Object.keys(sents).map((k) => sents[k])

	document.querySelector("#sel-sents").innerHTML = `<option value="none">none</option>`;

	for (let i of arr) {
		document.querySelector("#sel-sents").innerHTML += `<option value="${i}">${i}</option>`;
	}
}

// === Fetching Dependency SVG ===
function generate_dependency(val) {
	var url = _dependecy_r_ + "?text=" + encodeURIComponent(val);
	fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		})
		.then((response) => response.json())
		.then((data) => {
			var svg = data["dependency"];
			if (document.querySelector("#keep").checked) {
				document.querySelector("#out_svg").innerHTML += svg;
			} else {
				document.querySelector("#out_svg").innerHTML = svg;
			}
		})
		.catch((error) => {
			console.log("Error:", error);
		});
}


// ================ Visualization ======================
function update_chart() {
	var mcw = segments['mcw']
	var label = [];
	var val = [];

	for (let i of mcw) {
		console.log(i)
		label.push(i[0][0])
		val.push(i[1])
	}


	var oilCanvas = document.getElementById("oilChart");

	Chart.defaults.global.defaultFontFamily = "Lato";
	Chart.defaults.global.defaultFontSize = 18;

	var oilData = {
		labels: label,
		datasets: [{
			data: val,
			backgroundColor: [
				"#FF6384",
				"#63FF84",
				"#84FF63",
				"#8463FF",
				"#6384FF"
			]
		}]
	};

	var pieChart = new Chart(oilCanvas, {
		type: 'pie',
		data: oilData
	});
}


// ============================== OUTPUT PROCESSING =====================
var target = document.querySelector('#segment-main');
var dl = document.querySelector('.dl');
var pop = document.querySelector('#pop');
var pop_ul = document.querySelector('#pop-ul');
var more_btn = `<li onclick="expand()" class="more_btn">More ...</li>`;
var m_btn = document.querySelector("more_btn");


// TODO: V2.0 Add liner support
// var liner_btn = `<li class="liner_btn">Liner</li>`;
// var l_btn = document.querySelector(".liner_btn");

var last_target;
document.addEventListener('click', function (e) {
	e = e || window.event;
	var target = e.target || e.srcElement,
		text = target.textContent || target.innerText;

	if (target.tagName == 'SPAN' && target.classList.contains("tr_block")) {
		last_target = target.parentNode;
		fetch_syn(target)
		move_pop(target)
	} else {
		if (!pop.contains(target)) {
			pop.style.display = 'none';
		} else {
			if (target.tagName == 'SPAN') {
				last_target.innerHTML = "";
				last_target.innerHTML += `<span class="tr_block t-inserted">${target.textContent}</span>`;
			}
		}
	}

}, false);


function get_opposite() {
	try {
		var word = last_target.firstChild.textContent.replace(/\s/g, '');
		var url = opposite + "?text=" + encodeURIComponent(word);
		fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				}
			})
			.then((response) => response.json())
			.then((data) => {
	
				for (let i of data["antonyms"]) {
					console.log(i);
					document.querySelector("#pop-desc").textContent = data["antonyms"];
	
				}
	
				document.querySelector("#popm").style.display = "block";
				document.querySelector("#pop-h").textContent = "Get Antonyms"
	
			})
			.catch((error) => {
				console.log("Error:", error);
			});
	} catch (e) {
		alert("Please select a word in generated output and then try again!")
	}

}


function get_usage() {
	try {
		var word = last_target.firstChild.textContent.replace(/\s/g, '');
		var url = _usage_ + "?text=" + encodeURIComponent(word);
		fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				}
			})
			.then((response) => response.json())
			.then((data) => {
				console.log(data)
				document.querySelector("#popz").innerHTML = "";
	
				for (let i of data["definitions"]) {
					console.log(i)
					var li = document.createElement("li");
					li.innerHTML = i;
					document.querySelector("#popz").appendChild(li);
				}
	
				document.querySelector("#popm").style.display = "block";
				document.querySelector("#pop-h").textContent = "Get usage"
	
			})
			.catch((error) => {
				console.log("Error:", error);
			});
	} catch(e) {
		alert("Please select a word in generated output and then try again!")

	}
}

function move_pop(x) {
	pop.style.display = 'block';
	var r = x.getBoundingClientRect();
	var style = x.currentStyle || window.getComputedStyle(x);
	var ttop = x.offsetHeight + 2;
	pop.style.top = r.top + ttop + window.pageYOffset + 'px';
	pop.style.left = r.left + 'px';
}

function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}

// const map = {"first" : "1", "second" : "2"};
// console.log(getKeyByValue(map,"2"));

String.prototype.rtrim = function () {
	return this.replace(/((\s*\S+)*)\s*/, "$1");
}


function expand() {
	var hiddenPNodes = document.querySelectorAll('.exp');
	var first7 = Array.from(hiddenPNodes).slice(0, 7);
	first7.forEach(element => {
		element.classList.remove('exp');
	});
	if (hiddenPNodes.length <= 7) {
		collapse();
	}
}


function collapse() {
	document.querySelector('.more_btn').classList.add('exp');
}


function fetch_syn(x) {
	// var text = x.parentElement.textContent;
	var data = segments['data']
	// var index = data.findIndex(p => p.text == text.rtrim());
	var index = x.parentElement.className.split("-").pop();
	var syn = data[index - 1]["syn"]
	// var liner = data[index]['fillers']
	// console.log(x, x.parentNode)
	pop_ul.innerHTML = "";
	var i = 0;

	if (x.parentNode.childElementCount > 1) {
		for (let [i, value] of x.parentNode.childNodes.entries()) {
			if (i !== 0) {
				for (let k of syn) {
					i += 1;
					if (i <= 7) {
						var payload = `<li><span>${k} ${value.textContent} </span><svg class="ts" focusable="false" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></li>`;
						pop_ul.innerHTML += payload;
					} else {
						var payload = `<li class="exp"><span>${k} ${value.textContent} </span><svg class="ts" focusable="false" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></li>`;
						pop_ul.innerHTML += payload;
					}
				}
			}
		}
	} else {
		for (let k of syn) {
			i += 1;
			if (i <= 7) {
				var payload = `<li><span>${k} </span><svg class="ts" focusable="false" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></li>`;
				pop_ul.innerHTML += payload;
			} else {
				var payload = `<li class="exp"><span>${k} </span><svg class="ts" focusable="false" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></li>`;
				pop_ul.innerHTML += payload;
			}
		}
	}


	if (i > 7) {
		pop_ul.innerHTML += more_btn;
	}

	// TODO: Add liners mapped to all syn-net 
	// TODO: Aim version v2.0
	// if (liner !== "") {
	//   pop_ul.innerHTML += liner_btn;
	// }
}


function api_props() {
	var msg = segments['message']
	var traceID = segments['traceID']
	var code = segments['code']
	var status = segments['status']

	document.querySelector("#msg").textContent = msg;
	document.querySelector("#traceID").textContent = traceID;
	document.querySelector("#code").textContent = code;
	document.querySelector("#status").textContent = status;
}


function build_segments() {
	var data = segments['data']
	var k = 0;
	target.innerHTML = "";

	for (let i of data) {
		k += 1;
		var chuncks = i['text']
		var syn = i['syn']
		var post = i['post']
		var ch_gap = chuncks.split(' ');
		var span_parent = document.createElement('span');
		span_parent.className = `p-${k}`;

		for (const [i, value] of ch_gap.entries()) {
			if (i === ch_gap.length - 1) {
				span_parent.innerHTML += `<span class="tr_block">${value}${post} </span>`;
				// console.log(i, value)
			} else {
				span_parent.innerHTML += `<span class="tr_block">${value} </span>`;
			}
		}
		target.appendChild(span_parent);
	}
}

// copy text to clipboard from element
function copytext(x) {
	//    console.log(x.parentElement.lastElementChild)
	var r = document.createRange();
	r.selectNode(document.querySelector(x));
	window.getSelection().removeAllRanges();
	window.getSelection().addRange(r);
	document.execCommand('copy');
	window.getSelection().removeAllRanges();
	showToast()

}

function showToast() {
	var x = document.getElementById("toast");
	document.getElementById("desc").innerHTML = text;
	x.className = "show";
	setTimeout(function () {
		x.className = x.className.replace("show", "");
	}, 5000);
}

// copy text to clipboard from text
function copy_var(text) {
	var dn = document.createElement("textarea");
	document.body.appendChild(dn);
	dn.value = text;
	dn.select();
	document.execCommand("copy");
	document.body.removeChild(dn);
	showToast()
}

function get_output_text() {
	return segment_main.textContent;
}