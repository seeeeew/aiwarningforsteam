// ==UserScript==
// @name         AI warning popup for Steam
// @namespace    https://github.com/seeeeew/aiwarningforsteam/
// @version      0.1.0
// @description  Shows the AI generated content disclosure on Steam store pages as a modal popup.
// @author       seeeeew
// @match        https://store.steampowered.com/app/*
// @grant        none
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function() {

	const strings = {
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
	};

	function findAIDisclosureHeader() {
		return [...document.querySelectorAll(".game_page_autocollapse > #game_area_content_descriptors > h2")].filter(element => Object.values(strings).includes(element.textContent))[0];
	}

	function createWarning(header) {
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
						<div class="newmodal_close aiwarning_close"></div>
						<div class="title_text aiwarning_header"></div>
					</div>
				</div>
				<div class="newmodal_content_border">
					<div class="newmodal_content">
						<div class="newmodal_prompt_description fullwidth aiwarning_content"></div>
						<div style="float: right">
							<div class="btn_blue_steamui btn_medium aiwarning_close">
								<span>Close</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
		container.querySelector(".aiwarning_header").textContent = header.textContent;
		container.querySelector(".aiwarning_content").append(...[...header.parentNode.cloneNode(true).childNodes].filter(node => node.tagName != "H2"));
		container.querySelectorAll(".aiwarning_close").forEach(element => element.addEventListener("click", event => container.remove()));
		container.addEventListener("click", event => {
			if (event.target === container) container.remove();
		});
		document.body.append(container);
	}

	const header = findAIDisclosureHeader();
	if (header) {
		createWarning(header);
	}

})();