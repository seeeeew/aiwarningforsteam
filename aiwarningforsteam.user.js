// ==UserScript==
// @name         AI warning for Steam
// @namespace    https://github.com/seeeeew/aiwarningforsteam
// @version      0.2.4
// @description  Shows the AI Generated Content Disclosure on Steam store pages as a modal popup.
// @author       seeeeew
// @match        https://store.steampowered.com/app/*
// @icon         https://raw.githubusercontent.com/seeeeew/aiwarningforsteam/refs/heads/main/img/logo128.png
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
		const values = Object.values(msg.aidisclosure);
		return [...document.querySelectorAll(".game_page_autocollapse > #game_area_content_descriptors > h2")].find(element => values.includes(element.textContent));
	}

	function findKeyForValue(object, value) {
		return Object.keys(object).find(key => object[key] === value);
	}

	function createWarning(header) {
		const language = findKeyForValue(msg.aidisclosure, header.textContent);
		const container = document.createElement("div");
		container.classList.add("aiwarning_container");
		container.style.position = "fixed";
		container.style.inset = "0px";
		container.style.backdropFilter = "blur(25px)";
		container.style.zIndex = "1999"; // cookie consent popup has 2000
		container.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
		container.style.display = "flex";
		container.style.justifyContent = "center";
		container.style.alignItems = "center";
		container.innerHTML = `
			<div class="newmodal" style="box-shadow: 0px 0px 10px #000000;">
				<div class="modal_top_bar"></div>
				<div class="newmodal_header_border">
					<div class="newmodal_header">
						<div class="newmodal_close"></div>
						<div class="title_text">${header.innerHTML}</div>
					</div>
				</div>
				<div class="newmodal_content_border">
					<div class="newmodal_content" style="max-height: 350px;">
						<div class="newmodal_prompt_description"></div>
						<div class="newmodal_buttons">
							<div class="btn_blue_steamui btn_medium aiwarning_close">
								<span>${msg.close[language]}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
		container.querySelector(".newmodal_prompt_description").append(...[...header.parentNode.childNodes].filter(node => node !== header).map(node => node.cloneNode(true)));
		container.querySelectorAll(".newmodal_close, .aiwarning_close").forEach(element => element.addEventListener("click", event => container.remove()));
		container.addEventListener("click", event => {
			if (event.target === container) container.remove();
		});
		document.body.append(container);
	}

	const header = findAIDisclosureHeader();
	const warning = document.querySelector(".aiwarning_container");
	if (header && !warning) {
		createWarning(header);
	}

})();