// ==UserScript==
// @name         AI warning for Steam
// @namespace    https://github.com/seeeeew/aiwarningforsteam
// @version      1.0.0
// @description  Shows the AI Generated Content Disclosure on Steam store pages as a modal popup.
// @author       seeeeew
// @homepage     https://github.com/seeeeew/aiwarningforsteam
// @match        https://store.steampowered.com/app/*
// @icon         https://raw.githubusercontent.com/seeeeew/aiwarningforsteam/refs/heads/main/img/icon128.png
// @grant        none
// @run-at       document-end
// @updateURL    https://github.com/seeeeew/aiwarningforsteam/raw/refs/heads/main/aiwarningforsteam.user.js
// @downloadURL  https://github.com/seeeeew/aiwarningforsteam/raw/refs/heads/main/aiwarningforsteam.user.js
// @supportURL   https://github.com/seeeeew/aiwarningforsteam/issues
// @license      MIT
// ==/UserScript==

(function() {

	const msg = {
		aidisclosure: {
			schinese: "AI 生成内容披露",
			tchinese: "AI 生成內容聲明",
			japanese: "AI生成コンテンツの開示",
			koreana: "AI 생성 콘텐츠 사용 공개",
			thai: "การเปิดเผยข้อมูลเกี่ยวกับเนื้อหาที่สร้างด้วย AI",
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
			indonesian: "Pernyataan Konten Buatan AI",
			hungarian: "Nyilatkozat MI generálta tartalomról",
			dutch: "Informatie over door AI gegenereerde inhoud",
			norwegian: "Opplysning om AI-generert innhold",
			polish: "Oświadczenie w sprawie treści generowanych przez SI",
			portuguese: "Divulgação de conteúdo gerado por IA",
			brazilian: "Divulgação de conteúdo gerado por IA",
			romanian: "Informații despre conținutul generat de IA",
			russian: "Информация о контенте, созданном с помощью ИИ",
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
			indonesian: "Tutup",
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

	function findAIDisclosureHeader() {
		const titles = Object.values(msg.aidisclosure);
		return [...document.querySelectorAll(".game_page_autocollapse > #game_area_content_descriptors > h2")].find(element => titles.includes(element.textContent));
	}

	function injectStyle() {
		const style = document.createElement("style");
		style.innerHTML = `
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
		document.head.append(style);
		return style;
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
		} else if (typeof chrome !== "undefined") {
			metadata.homepage = chrome.runtime.getManifest().homepage_url;
			metadata.name = chrome.runtime.getManifest().name;
			metadata.version = chrome.runtime.getManifest().version;
		}
		return metadata;
	}

	function findKeyForValue(object, value) {
		return Object.keys(object).find(key => object[key] === value);
	}

	function createWarning(header) {
		const style = injectStyle();
		const {homepage, name, version} = getMetadata();
		const language = findKeyForValue(msg.aidisclosure, header.textContent);
		const container = document.createElement("div");
		container.classList.add("aiwarning_container");
		const appname = document.querySelector("#appHubAppName")?.textContent;
		const title = header.innerHTML + (appname ? " for " + appname : "");
		container.innerHTML = `
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
	if (header && !warning) {
		createWarning(header);
	}

})();