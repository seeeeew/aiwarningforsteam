// ==UserScript==
// @name         AI warning for Steam
// @namespace    https://github.com/seeeeew/aiwarningforsteam
// @version      1.1.0
// @description  Adds features to increase the visibility of AI Generated Content Disclosures.
// @author       seeeeew
// @homepage     https://github.com/seeeeew/aiwarningforsteam
// @match        https://store.steampowered.com/app/*
// @match        https://store.steampowered.com/search*
// @icon         https://raw.githubusercontent.com/seeeeew/aiwarningforsteam/refs/heads/main/img/icon128.png
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// @updateURL    https://github.com/seeeeew/aiwarningforsteam/raw/refs/heads/main/aiwarningforsteam.user.js
// @downloadURL  https://github.com/seeeeew/aiwarningforsteam/raw/refs/heads/main/aiwarningforsteam.user.js
// @supportURL   https://github.com/seeeeew/aiwarningforsteam/issues
// @license      MIT
// ==/UserScript==

(function() {

	if (window.browser == undefined && window.chrome !== undefined) window.browser = window.chrome;

	const msg = {
		aidisclosure: {
			schinese: "AI 生成内容披露",
			tchinese: "AI 生成內容聲明",
			japanese: "AI生成コンテンツの開示",
			koreana: "AI 생성 콘텐츠 사용 공개",
			thai: "การเปิดเผยข้อมูลเกี่ยวกับเนื้อหาที่สร้างด้วย AI",
			indonesian: "Pernyataan Konten Buatan AI",
			malay: "Pendedahan Kandungan Dihasilkan AI",
			bulgarian: "Оповестяване за съдържание, генерирано от ИИ",
			czech: "Informace o obsahu vytvářeném AI",
			danish: "Meddelelse om AI-genereret indhold",
			german: "Offenlegung von KI-generierten Inhalten",
			english: "AI Generated Content Disclosure",
			spanish: "Información sobre contenido generado por IA",
			latam: "Información sobre contenido generado por IA",
			greek: "Γνωστοποίηση περιεχομένου που δημιουργήθηκε από τεχνητή νοημοσύνη (AI)",
			french: "Divulgation de contenu généré par IA",
			italian: "Divulgazione dei contenuti generati dall'IA",
			hungarian: "Nyilatkozat MI generálta tartalomról",
			dutch: "Informatie over door AI gegenereerde inhoud",
			norwegian: "Opplysning om AI-generert innhold",
			polish: "Oświadczenie w sprawie treści generowanych przez SI",
			portuguese: "Divulgação de conteúdo gerado por IA",
			brazilian: "Divulgação de conteúdo gerado por IA",
			romanian: "Informații despre conținutul generat de IA",
			russian: "Информация об ИИ-контенте",
			finnish: "Tiedote tekoälysisällöstä",
			swedish: "Upplysning om AI-genererat innehåll",
			turkish: "Yapay Zekâ İçeriği Açıklaması",
			vietnamese: "Công bố về nội dung tạo bởi AI",
			ukrainian: "Розкриття інформації щодо вмісту, згенерованого ШІ",
		},
		close: {
			schinese: "关闭",
			tchinese: "關閉",
			japanese: "閉じる",
			koreana: "닫기",
			thai: "ปิด",
			indonesian: "Tutup",
			malay: "Tutup",
			bulgarian: "Затваряне",
			czech: "Zavřít",
			danish: "Luk",
			german: "Schließen",
			english: "Close",
			spanish: "Cerrar",
			latam: "Cerrar",
			greek: "Κλείσιμο",
			french: "Fermer",
			italian: "Chiudi",
			hungarian: "Bezárás",
			dutch: "Sluiten",
			norwegian: "Lukk",
			polish: "Zamknij",
			portuguese: "Fechar",
			brazilian: "Fechar",
			romanian: "Închide",
			russian: "Закрыть",
			finnish: "Sulje",
			swedish: "Stäng",
			turkish: "Kapat",
			vietnamese: "Đóng",
			ukrainian: "Закрити",
		}
		// Currently latam and brazilian aren't recognized and are only included
		// for completeness, but we can ignore that for now, because both their
		// strings are identical to spanish and portuguese respectively.
	}

	function getMetadata() {
		const metadata = {};
		if (typeof GM_info !== "undefined") {
			metadata.homepage = GM_info.script.homepage;
			metadata.name = GM_info.script.name;
			metadata.version = GM_info.script.version;
		} else if (typeof browser !== "undefined") {
			metadata.homepage = browser.runtime.getManifest().homepage_url;
			metadata.name = browser.runtime.getManifest().name;
			metadata.version = browser.runtime.getManifest().version;
		}
		return metadata;
	}
	const {homepage, name, version} = getMetadata();

	const Config = {
		set: async (key, value) => {
			if (typeof GM_setValue !== "undefined") {
				GM_setValue(key, value);
			} else if (typeof browser !== "undefined") {
				await browser.storage.sync.set({[key]: value});
			}
		},
		get: async (key) => {
			if (typeof GM_getValue !== "undefined") {
				return GM_getValue(key);
			} else if (typeof browser !== "undefined") {
				return (await browser.storage.sync.get(key))[key];
			}
		}
	}

	const AIDisclosureCache = {
		set: async (appid, aidisclosure) => {
			const key = "app-" + appid;
			const value = {
				aidisclosure,
				updated: new Date().toISOString()
			};
			if (typeof GM_setValue !== "undefined") {
				GM_setValue(key, value);
			} else if (typeof browser !== "undefined") {
				await browser.storage.local.set({[key]: value});
			}
		},
		get: async (appid) => {
			const key = "app-" + appid;
			let value;
			if (typeof GM_getValue !== "undefined") {
				value = GM_getValue(key);
			} else if (typeof browser !== "undefined") {
				value = (await browser.storage.local.get(key))[key];
			}
			const {aidisclosure, updated: updatedString} = value || {};
			const age = Date.now() - new Date(updatedString).getTime();
			if (age < (aidisclosure ? 30 : 7) * 24 * 60 * 60 * 1000) {
				return aidisclosure;
			}
		}
	};

	function html(strings, ...values) {
		const template = document.createElement("template");
		template.innerHTML = String.raw({raw: strings}, ...values).trim();
		const nodes = template.content.childNodes;
		return nodes.length === 1 ? nodes[0] : nodes;
	}

	function injectStyle(source) {
		const style = document.createElement("style");
		style.innerHTML = source;
		style.id = "aiwarning_style";
		document.head.append(style);
		return style;
	}

	if (window.location.pathname.match(/^\/app(\/|$)/)) {
		function findAIDisclosureHeader() {
			const titles = Object.values(msg.aidisclosure);
			return [...document.querySelectorAll(".game_page_autocollapse > #game_area_content_descriptors > h2")].find(element => titles.includes(element.textContent));
		}

		const css = `
			.aiwarning_container {
				position: fixed;
				inset: 0px;
				backdrop-filter: blur(25px);
				z-index: 1999; /* cookie consent popup has 2000 */
				background-color: rgba(0, 0, 0, 0.6);
				display: flex;
				justify-content: center;
				align-items: center;
			}
			.aiwarning_container .newmodal {
				box-shadow: 0px 0px 10px #000000;
				position: relative;
			}
			.aiwarning_container .title_text {
				margin-right: 20px;
			}
			.aiwarning_container .newmodal_content {
				max-height: 350px;
			}
			.aiwarning_watermark {
				position: absolute;
				left: 10px;
				bottom: 10px;
				color: white;
				opacity: 0.25;
				text-decoration: none;
				font-size: 12px;
			}
			.aiwarning_watermark:hover {
				opacity: 0.6;
			}
		`;

		function findKeyForValue(object, value) {
			return Object.keys(object).find(key => object[key] === value);
		}

		function createWarning(header) {
			const style = injectStyle(css);
			const language = findKeyForValue(msg.aidisclosure, header.textContent);
			const appname = document.querySelector("#appHubAppName")?.textContent;
			const title = header.innerHTML + (appname ? " — " + appname : "");
			const container = html`
				<div class="aiwarning_container">
					<div class="newmodal">
						<div class="modal_top_bar"></div>
						<div class="newmodal_header_border">
							<div class="newmodal_header">
								<div class="newmodal_close"></div>
								<div class="title_text">${title}</div>
							</div>
						</div>
						<div class="newmodal_content_border">
							<div class="newmodal_content">
								<div class="newmodal_prompt_description"></div>
								<div class="newmodal_buttons">
									<div class="btn_blue_steamui btn_medium aiwarning_close">
										<span>${msg.close[language]}</span>
									</div>
								</div>
							</div>
						</div>
						<a href="${homepage}" class="aiwarning_watermark">${name} v${version}</a>
					</div>
				</div>
			`;
			container.querySelector(".newmodal_prompt_description").append(...[...header.parentNode.childNodes].filter(node => node !== header).map(node => node.cloneNode(true)));
			function closeWarning() {
				container.remove();
				style.remove();
			}
			container.querySelectorAll(".newmodal_close, .aiwarning_close").forEach(element => element.addEventListener("click", closeWarning));
			container.addEventListener("click", event => {
				if (event.target === container) closeWarning();
			});
			document.body.append(container);
		}

		const header = findAIDisclosureHeader();
		const warning = document.querySelector(".aiwarning_container");
		if (header && !warning) createWarning(header);
		const appid = window.location.pathname.match("^/app/(?<appid>\\d+)")?.groups.appid;
		if (appid) AIDisclosureCache.set(appid, !!header);
	}

	if (window.location.pathname.match(/^\/search(\/|$)/)) {
		const css = `
			#search_resultsRows > a.search_result_row.aiwarning_checking .responsive_search_name_combined::after {
				position: absolute;
				top: 0;
				right: 0;
				content: "Checking for ${msg.aidisclosure.english}";
				background: url("https://community.fastly.steamstatic.com/public/images/login/throbber.gif") no-repeat;
				background-size: 1lh;
				height: 1lh;
				font-size: 10px;
				padding-left: 1.25lh;
				margin: 2px 4px;
			}
			[data-aiwarning]:not([data-aiwarning=show]) #search_resultsRows > a.search_result_row.aiwarning_failed .responsive_search_name_combined::after {
				position: absolute;
				top: 0;
				right: 0;
				content: "Checking for ${msg.aidisclosure.english} failed";
				font-size: 10px;
				margin: 2px 4px;
				color: red;
				opacity: 0.5;
			}
			[data-aiwarning=blur] #search_resultsRows > a.search_result_row.aiwarning_hasdisclosure:not(:hover) {
				&::before {
					z-index: 998;
					position: absolute;
					inset: 0 0 0 0;
					display: flex;
					justify-content: center;
					align-items: center;
					content: "${msg.aidisclosure.english} found";
					font-size: clamp(12px, 1.3vw, 16px);
					font-weight: bold;
				}
				&::after {
					z-index: 998;
					position: absolute;
					inset: 0 0 0 0;
					display: flex;
					justify-content: center;
					align-items: flex-end;
					margin: 2px 4px;
					content: "${name} v${version}";
					font-size: 10px;
					color: white;
					opacity: 0.25;
				}
				& > * {
					filter: blur(10px);
				}
			}
			[data-aiwarning=hide] #search_resultsRows > a.search_result_row.aiwarning_hasdisclosure {
				display: none;
			}
			#aiwarning_filter .block_content {
				transition: 200ms ease-in-out;
				transition-property: max-height, padding, margin;
				overflow-y: hidden;
			}
			#aiwarning_filter.collapsed .block_content {
				padding-top: 0;
				padding-bottom: 0;
				margin-top: 0;
				margin-bottom: 0;
			}
		`;
		injectStyle(css);

		const search_results = document.getElementById("search_results");
		async function injectSearchOptions() {
			let filtermode = await Config.get("filtermode") || "blur";
			search_results.dataset.aiwarning = filtermode;
			const container = html`
				<div class="block search_collapse_block" data-collapse-name="aiwarning_filter" id="aiwarning_filter" data-gpnav="rows" data-gpfocus="group">
					<div data-panel='{"focusable":true,"clickOnActivate":true}' role="button" class="block_header labs_block_header" title="${name} v${version}">
						<div>Narrow by ${msg.aidisclosure.english}</div>
					</div>
					<div class="block_content block_content_inner" style="display: block;">
						<input type="hidden" id="hide" name="hide" value="">
					</div>
				</div>
			`;
			const content = container.querySelector(".block_content");
			const options = [
				{value: "blur", label: "Blur games with AI disclosure"},
				{value: "hide", label: "Hide games with AI disclosure"}
			];
			options.forEach(({value, label}) => {
				const option = html`
					<div class="tab_filter_control_row" data-param="aiwarning_filter" data-value="${value}" data-clientside="1">
						<span data-panel="{&quot;focusable&quot;:true,&quot;clickOnActivate&quot;:true}" role="button" class="tab_filter_control tab_filter_control_include " data-param="aiwarning_filter" data-value="${value}" data-clientside="1" data-gpfocus="item">
							<span class="tab_filter_label_container">
								<span class="tab_filter_control_checkbox"></span>
								<span class="tab_filter_control_label">${label}</span>
								<span class="tab_filter_control_count" style="display: none;"></span>
							</span>
						</span>
					</div>
				`;
				if (value == filtermode) {
					const checked = option.classList.add("checked");
					option.querySelector(".tab_filter_control").classList.add("checked");
				}
				option.addEventListener("click", () => {
					content.querySelectorAll(".checked").forEach((element) => {
						if (element != option) element.classList.remove("checked");
					});
					const checked = option.classList.toggle("checked");
					option.querySelector(".tab_filter_control").classList.toggle("checked", checked);
					filtermode = checked ? value : "show";
					search_results.dataset.aiwarning = filtermode;
					Config.set("filtermode", filtermode);
					findNew();
				});
				content.append(option);
			});
			const last = document.querySelector("#additional_search_options :nth-last-child(-n + 1 of .block)");
			last.after(container);
			const contentHeight = content.offsetHeight + "px";
			const collapsed = await Config.get("searchoptions-collapsed") || false;
			if (collapsed) {
				content.style.maxHeight = 0;
				container.classList.add("collapsed");
			} else {
				content.style.maxHeight = contentHeight;
			}
			function toggleCollapsed() {
				content.offsetHeight; // workaround to force correct rendering
				const collapsed = container.classList.toggle("collapsed");
				content.style.maxHeight = collapsed ? 0 : contentHeight;
				Config.set("searchoptions-collapsed", collapsed);
			}
			container.querySelector(".block_header").addEventListener("click", toggleCollapsed);
		}
		injectSearchOptions();

		async function check(row) {
			const appid = row.dataset.dsAppid;
			try {
				row.dataset.aiwarningChecked = true;
				let aidisclosure = false;
				const cached = await AIDisclosureCache.get(appid);
				if (cached !== undefined) {
					aidisclosure = cached;
				} else {
					row.classList.add("aiwarning_checking");
					const url = `https://store.steampowered.com/app/${appid}?l=english`;
					const response = await fetch(url);
					const text = await response.text();
					const match = text.match(`<h2>${msg.aidisclosure.english}</h2>`);
					aidisclosure = !!match;
					AIDisclosureCache.set(appid, aidisclosure);
				}
				if (aidisclosure) row.classList.add("aiwarning_hasdisclosure");
			} catch(error) {
				console.error(`Check for ${msg.aidisclosure.english} of App ${appid} failed.`, error);
				row.classList.add("aiwarning_failed");
			} finally {
				row.classList.remove("aiwarning_checking");
			}
		}
		function findNew() {
			const rows = document.querySelectorAll("#search_results[data-aiwarning]:not([data-aiwarning=show]) #search_resultsRows > a.search_result_row[data-ds-appid]:not([data-aiwarning-checked])");
			rows.forEach(row => check(row));
		}
		const observer = new MutationObserver(findNew);
		observer.observe(search_results, {childList: true, subtree: true});
	}
})();