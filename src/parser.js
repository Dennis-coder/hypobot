const Mathml2latex = require('mathml-to-latex');

/**
 * Parses a Gleerups article into the format used in the Cortexio editor
 * @param {string} html - The html string to be parsed
 * @var {HTMLDivElement} wrapper - A wrapper div element used to insert the html to be parsed
 * @var {HTMLDivElement[]} pages - A list of the different .article-page elements if the html to be parsed has pages or a list with the wrapper element
 * @returns {string[]} List of the html string for every page
 */
export function parser(html) {
  let wrapper = document.createElement('div')
  wrapper.innerHTML = html
  let hasPages = true

  let pages = wrapper.querySelectorAll('.article-page')
  if (pages.length == 0) {
    pages = wrapper.childNodes
    hasPages = false
  }

  let parsedPages = distributeElements(pages)

  if (!hasPages) {
    parsedPages = [parsedPages]
  }

  let out = []
  for (let page of parsedPages) {
    let temp = document.createElement('div')
    for (let el of page.flat(Infinity)) {
      temp.appendChild(el)
    }
    out.push(temp.innerHTML)
  }

  return out
}

/**
 * Takes an element and distributes it to a parser function depending on classes and tagname
 * @param {HTMLElement} el - The element to be parsed
 * @returns {HTMLElement} The parsed element
 */
function distributor(el) {
  if (!el) {
    return null
  }

  if (el.classList) {
    if (el.classList.contains('article-page')) return pageParser(el)
    if (el.classList.contains('cell-group')) return cellGroupParser(el)
    if (el.classList.contains('cell')) return cellParser(el)
    if (el.classList.contains('cell-content')) return cellContentParser(el)
    if (el.classList.contains('box-summary')) return boxParser(el, 'olive')
    if (el.classList.contains('box-standard')) return boxParser(el, 'default')
    if (el.classList.contains('box-help')) return boxParser(el, 'yellow')
    if (el.classList.contains('box-practice')) return boxParser(el, 'blue')
    if (el.classList.contains('box-example')) return boxParser(el, 'pink')
    if (el.classList.contains('article-component')) return componentParser(el)
    if (el.classList.contains('expandable')) return expandableDivParser(el)
    if (el.classList.contains('gca-component')) return gcaComponentParser(el)
    if (el.classList.contains('questbox')) return null
    if (el.classList.contains('htmlcomponent-header')) return componentHeaderParser(el)
    if (el.classList.contains('mjx-chtml')) return equationHandler(el)
  }

  switch (el.tagName) {
    case undefined:
      return el
    case "P":
      return pTagParser(el)
    case "STRONG":
      return strongTagParser(el)
    case "EM":
      return emTagParser(el)
    case "UL":
      return ulTagParser(el)
    case "OL":
      return olTagParser(el)
    case "BLOCKQUOTE":
      return blockquoteTagParser(el)
    case "TABLE":
      return tableTagParser(el)
    case "H4":
      return h4TagParser(el)
    case "SPAN":
      return spanTagParser(el)
    case "LI":
      return liTagParser(el)
    case "TBODY":
      return tbodyTagParser(el)
    case "TR":
      return trTagParser(el)
    case "TD":
      return tdTagParser(el)
    case "TH":
      return thTagParser(el)
    case 'BR':
      return el
    case 'FIGURE':
      return figureTagParser(el)
    case 'IMG':
      return imgTagParser(el)
    case 'SUB':
      return subTagParser(el)
    case 'DIV':
      return divTagParser(el)
    case 'A':
      return aTagParser(el)
  }
}

/**
 * Takes a list of elements and returns a list of the parsed elements
 * @param {HTMLElement[]} els - The list of elements to be parsed
 * @returns {HTMLElement[]} List of the parsed elements
 */
function distributeElements(els) {
  let parsedEls = []
  for (let el of els) {
    let parsedEl = distributor(el)
    if (parsedEl) {
      parsedEls.push(parsedEl)
    }
  }
  return parsedEls
}

/**
 * Takes a page and returns a list of its parsed content
 * @param {HTMLDivElement} el - The page to be parsed
 * @var {HTMLDivElement[]} cells - List of the page's cells
 * @returns {HTMLElement[]} List of the page's parsed content
 */
function pageParser(el) {
  let cells = el.querySelectorAll('.cell:not(.cell-empty)')
  return distributeElements(cells)
}

/**
 * Takes a cellgroup and returns a list of its parsed content
 * @param {HTMLDivElement} el - The cellgroup to be parsed
 * @var {HTMLDivElement[]} cells - List of the cellgroup's cells
 * @returns {HTMLElement[]} List of the cellgroup's parsed content
 */
function cellGroupParser(el) {
  let cells = el.querySelectorAll('.cell:not(.cell-empty)')
  return distributeElements(cells)
}

/**
 * Takes a cell and returns a list of its parsed content
 * @param {HTMLDivElement} el - The cell to be parsed
 * @returns {HTMLElement[]} List of the cell's parsed content
 */
function cellParser(el) {
  return distributeElements(el.childNodes)
}

/**
 * Takes a cell's content div and returns a list of its parsed content
 * @param {HTMLDivElement} el - The cell's content div to be parsed
 * @returns {HTMLElement[]} List of the cell's content div's parsed content
 */
function cellContentParser(el) {
  return distributeElements(el.childNodes)
}

/**
 * Takes the div element of an expandable box and returns the parsed box
 * @param {HTMLDivElement} box - The div element of an expandable box
 * @var {HTMLDivElement} contentDiv - The expandable box's content div
 * @var {HTMLDivElement} titleDiv - The expandable box's title div
 * @returns {HTMLDivElement} - The parsed box
 */
function expandableDivParser(box) {
  let contentDiv = box.querySelector('.expandable-area')
  let parsedContent = distributeElements(contentDiv.childNodes)

  let titleDiv = box.querySelector('.expandable-title')
  if (titleDiv) {
    if (titleDiv.nextElementSibling) {
      let discriptionText = titleDiv.nextElementSibling.innerHTML
      let discription = document.createElement('p')
      discription.innerHTML = `<i>${discriptionText}</i>`
      parsedContent.unshift(discription)
    }

    let title = document.createElement("h4")
    title.innerHTML = titleDiv.textContent
    parsedContent.unshift(title)
  }

  parsedContent = parsedContent.flat(Infinity)
  return boxGenerator(parsedContent, "default")
}

/**
 * Takes a component div and returns a list of its parsed content
 * @param {HTMLDivElement} el - The component div to be parsed
 * @returns {HTMLElement[]} List of the component div's parsed content
 */
function componentParser(el) {
  return distributeElements(el.childNodes)
}

/**
 * Takes a box div and returns the parsed box
 * @param {HTMLDivElement} box - The box div to be parsed
 * @param {string} color - The color the parsed box will be
 * @returns {HTMLDivElement} - The parsed box
 */
function boxParser(box, color) {
  let content = distributeElements(box.childNodes).flat(Infinity)
  return boxGenerator(content, color)
}

/**
 * Takes a list of the contents of a box and its color, creates the box and returns the box
 * @param {HTMLElement[]} content - List of the box's content
 * @param {string} color - String of the box's color
 * @var {HTMLDivElement} box - The created box div
 * @returns {HTMLDivElement} A new box
 */
function boxGenerator(content, color) {
  let box = document.createElement('div')
  box.classList.add("simplebox")
  box.classList.add(`hypo-box-${color}`)
  box.setAttribute("data-box-class", `hypo-box-${color}`)

  // Boxes usually have some title
  if (content[0].tagName == "H4") {
    box.setAttribute("data-show-header", "true")
    let title = content.shift()
    title.classList.add("simplebox-title")
    box.appendChild(title)
  } else {
    box.setAttribute("data-show-header", "false")
    // If the box has no header the h4 tag should still be there (but hidden)
    let hiddenTitle = document.createElement("h4")
    hiddenTitle.classList.add("simplebox-title", "hidden")
    box.appendChild(hiddenTitle)
  }

  let contentDiv = document.createElement('div')
  contentDiv.classList.add('simplebox-content')

  for (let el of content) {
    contentDiv.appendChild(el)
  }
  box.appendChild(contentDiv)
  return box
}

/**
 * Takes a gca component and returns it parsed
 * @param {HTMLDivElement} el - The gca component to be parsed
 * @returns {(HTMLDivElement | HTMLPElement)} The parsed component
 */
function gcaComponentParser(el) {
  if (el.querySelector('audio')) return gcaAudioComponent()
  if (el.querySelector('.video-embed')) return gcaVideoComponent()
}

/**
 * Creates an audio component and returns it
 * @returns {HTMLDivElement} An audio component
 */
function gcaAudioComponent() {
  let el = document.createElement("div")
  el.innerHTML = `<div class="hypo-audio" style="text-align:center"><audio controls="controls" controlslist="nodownload" src="this.data.src"><source src="this.data.src" /></audio></div>`
  el = el.firstElementChild
  return el
}

/**
 * Create a placeholder for embedded videos
 * @returns {HTMLPElement} A p element with the reminder
 */
function gcaVideoComponent() {
  let temp = document.createElement('p')
  temp.innerHTML = "<strong>[insert video here]</strong>"
  return temp
}

/**
 * Takes a component header div and returns an h4 element with the headers parsed text
 * @param {HTMLDivElement} el - The component header div to be parsed
 * @returns {HTMLHeaderElement} An h4 element with the headers parsed text
 */
function componentHeaderParser(el) {
  let parsedEl = document.createElement('h4')
  let node = distributor(el.firstChild)
  parsedEl.appendChild(node)
  return parsedEl
}

/**
 * Takes a span element and returns its parsed equation
 * @param {HTMLSpanElement} el - The span with the equation to be parsed
 * @returns {HTMLSpanElement} A span with the parsed equation
 */
function equationHandler(el) {
  let equation = el.getAttribute('data-mathml')
  equation = Mathml2latex.convert(equation)

  // Some equation systems are bugged so the if statement tries to fix that
  if (equation.substring(0, 13) == "\\left{\\right.") {
    equation = equation.replace("\\left{\\right.", "\\begin{cases}") + "\\end{cases}"
  }
  equation = "\\(" + equation + "\\)"

  let parsedEl = document.createElement('span')
  parsedEl.classList.add('math-tex')
  parsedEl.innerHTML = equation

  return parsedEl
}

/**
 * Takes a p element and parses it depending on potential classes and children
 * @param {HTMLPElement} el - The p element to be parsed
 * @returns {(HTMLPElement | HTMLHeaderElement | null)} The parsed p element
 */
function pTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)

  if (el.classList.contains('title-2') || el.classList.contains('title-3') || el.classList.contains('ingress')) {
    parsedEl = document.createElement("h4")
    nodes.forEach(node => parsedEl.appendChild(node))
  }

  else if (Array.from(el.children).some(c => c.tagName == "IMG")) {
    parsedEl.innerHTML = "<strong>[insert image here]</strong>"
  }

  else {
    nodes.forEach(node => parsedEl.appendChild(node))

    parsedEl.innerHTML = parsedEl.innerHTML.replaceAll('&nbsp;', ' ')

    if (parsedEl.textContent.trim().length == 0) {
      return null
    }
  }

  if (el.classList.contains('text-small')) {
    parsedEl.innerHTML = '<sub>' + parsedEl.innerHTML + '</sub>'
  }

  if (el.classList.contains('underline')) {
    parsedEl.innerHTML = '<u>' + parsedEl.innerHTML + '</u>'
  }

  if (el.classList.contains('indent')) {
    parsedEl.classList.add('hypo-text-indent')
  }

  if (el.classList.contains('align-center')) {
    parsedEl.style.textAlign = "center"
  }
  return parsedEl
}

/**
 * Takes a strong element and parses it
 * @param {HTMLStrongElement} el - The strong element to be parsed
 * @returns {HTMLStrongElement} The parsed strong element
 */
function strongTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)
  nodes.forEach(node => parsedEl.appendChild(node))
  return parsedEl
}

/**
 * Takes a em element and parses it
 * @param {HTMLEmElement} el - The em element to be parsed
 * @returns {HTMLIElement} The parsed i element
 */
function emTagParser(el) {
  let parsedEl = document.createElement('i')
  let nodes = distributeElements(el.childNodes)
  nodes.forEach(node => parsedEl.appendChild(node))
  return parsedEl
}

/**
 * Takes a ul element and parses it
 * @param {HTMLUlElement} el - The ul element to be parsed
 * @returns {HTMLUlElement} The parsed ul element
 */
function ulTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)
  nodes.forEach(node => parsedEl.appendChild(node))
  return parsedEl
}

/**
 * Takes a ol element and parses it
 * @param {HTMLOlElement} el - The ol element to be parsed
 * @returns {HTMLOlElement} The parsed ol element
 */
function olTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)
  nodes.forEach(node => parsedEl.appendChild(node))
  return parsedEl
}

/**
 * Takes a li element and parses it
 * @param {HTMLLiElement} el - The li element to be parsed
 * @returns {HTMLLiElement} The parsed li element
 */
function liTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)
  nodes.forEach(node => parsedEl.appendChild(node))
  return parsedEl
}

/**
 * Takes a blockquote element and parses it
 * @param {HTMLBlockquoteElement} el - The blockquote element to be parsed
 * @var {HTMLSpanElement} author - The author if provided
 * @returns {HTMLBlockquoteElement} The parsed blockquote element
 */
function blockquoteTagParser(el) {
  let author = el.querySelector('.quote-source')
  if (author) {
    el.removeChild(author)
  }

  let parsedEl = document.createElement(el.tagName)
  let p = document.createElement('p')
  let nodes = distributeElements(el.childNodes)

  nodes.forEach(node => p.appendChild(node))

  if (author) {
    p.innerHTML = p.innerHTML + '<br><sub>' + author.innerHTML + '</sub>'
  }
  parsedEl.appendChild(p)
  return parsedEl
}

/**
 * Takes a h4 element and parses it
 * @param {HTMLHeaderElement} el - The h4 element to be parsed
 * @returns {HTMLHeaderElement} The parsed h4 element
 */
function h4TagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)
  nodes.forEach(node => parsedEl.appendChild(node))
  return parsedEl
}

/**
 * Takes a span element and parses it depending on potential classes
 * @param {HTMLSpanElement} el - The span element to be parsed
 * @returns {HTMLSpanElement} The parsed span element
 */
function spanTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)

  nodes.forEach(node => parsedEl.appendChild(node))

  if (el.classList.contains('blue-text')) {
    parsedEl.style.color = "#0000ff"
  }

  if (el.classList.contains('red-text')) {
    parsedEl.style.color = "#ff0000"
  }

  return parsedEl
}

/**
 * Takes a table element and parses it
 * @param {HTMLTableElement} el - The table element to be parsed
 * @returns {HTMLDivElement} The parsed table in a div element
 */
function tableTagParser(el) {
  let parsedDiv = document.createElement('div')
  parsedDiv.classList.add('table-responsive')
  let parsedTable = document.createElement('table')
  parsedTable.classList.add(['hypo-table-responsive', 'table', 'table-bordered'])

  let nodes = distributeElements(el.childNodes)

  nodes.forEach(node => parsedTable.appendChild(node))

  parsedDiv.appendChild(parsedTable)
  return parsedDiv
}

/**
 * Takes a tbody element and parses it
 * @param {HTMLElement} el - The tbody element to be parsed
 * @returns {HTMLElement} The parsed tbody element
 */
function tbodyTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)
  nodes.forEach(node => parsedEl.appendChild(node))
  return parsedEl
}

/**
 * Takes a tr element and parses it
 * @param {HTMLTableRowElement} el - The tr element to be parsed
 * @returns {HTMLTableRowElement} The parsed tr element
 */
function trTagParser(el) {
  console.log(el)
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)
  nodes.forEach(node => parsedEl.appendChild(node))
  return parsedEl
}

/**
 * Takes a td element and parses it
 * @param {HTMLElement} el - The td element to be parsed
 * @returns {HTMLElement} The parsed td element
 */
function tdTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)

  nodes.forEach(node => parsedEl.appendChild(node))

  if (parsedEl.textContent.trim().length == 0) {
    return
  }

  let colspan = el.getAttribute('colspan')
  if (colspan) {
    parsedEl.setAttribute('colspan', colspan)
  }

  return parsedEl
}

/**
 * Takes a th element and parses it
 * @param {HTMLElement} el - The th element to be parsed
 * @returns {HTMLElement} The parsed th element
 */
function thTagParser(el) {
  if (el.textContent.trim().length == 0) {
    return
  }
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)

  nodes.forEach(node => parsedEl.appendChild(node))

  let colspan = el.getAttribute('colspan')
  if (colspan) {
    parsedEl.setAttribute('colspan', colspan)
  }

  return parsedEl
}

/**
 * Takes a sub element and parses it
 * @param {HTMLSubElement} el - The sub element to be parsed
 * @returns {HTMLSubElement} The parsed sub element
 */
function subTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)
  nodes.forEach(node => parsedEl.appendChild(node))
  return parsedEl
}

/**
 * Takes a figure element and parses it
 * @param {HTMLElement} el - The figure element to be parsed
 * @returns {HTMLPElement} The parsed p element
 */
function figureTagParser(el) {
  let temp = document.createElement('p')
  temp.innerHTML = "<strong>[insert image here]</strong>"
  return temp
}

/**
 * Takes an image element and parses it
 * @param {HTMLImageElement} el - The image element to be parsed
 * @returns {HTMLPElement} The parsed p element
 */
function imgTagParser(el) {
  let temp = document.createElement('p')
  temp.innerHTML = "<strong>[insert image here]</strong>"
  return temp
}

/**
 * Takes a div element and parses it
 * @param {HTMLDivElement} el - The div element to be parsed
 * @returns {HTMLDivElement} The parsed div element
 */
function divTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)
  nodes.forEach(node => parsedEl.appendChild(node))
  return parsedEl
}

function aTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = distributeElements(el.childNodes)

  nodes.forEach(node => parsedEl.appendChild(node))

  let target = el.getAttribute('target')
  if (target) {
    parsedEl.setAttribute('target', target)
  }

  let href = el.getAttribute('href')
  if (href) {
    parsedEl.setAttribute('href', href)
  }

  return parsedEl
}