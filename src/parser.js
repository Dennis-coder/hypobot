const Mathml2latex = require('mathml-to-latex');

export function parser(html) {
  let main = document.createElement('div')
  main.innerHTML = html
  let content = []
  let hasPages = true

  let pages = main.querySelectorAll('.article-page')
  if (pages.length == 0) {
    pages = [main]
    hasPages = false
  }

  for (let page of pages) {
    let parsedPage = distributor(page)
    content.push(parsedPage)
  }

  if (!hasPages) {
    content = [content]
  }

  let out = []
  for (let pageContent of content) {
    let temp = document.createElement('div')
    for (let el of pageContent) {
      temp.appendChild(el)
    }
    out.push(temp.innerHTML)
  }

  return out
}

function distributor(el) {
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
  }
}

function pageParser(el) {
  let content = []

  let cells = el.querySelectorAll('.cell:not(.cell-empty)')

  for (let cell of cells) {
    let parsedCell = distributor(cell)
    content.push(parsedCell)
  }
  return content.flat(Infinity)
}

function cellGroupParser(el) {
  let content = []

  let cells = el.querySelectorAll('.cell:not(.cell-empty)')

  for (let cell of cells) {
    let parsedCell = distributor(cell)
    if (parsedCell) {
      content.push(parsedCell)
    }
  }
  return content.flat(Infinity)
}

function cellParser(el) {
  let content = []

  for (let component of el.childNodes) {
    let parsedCellContent = distributor(component)

    if (parsedCellContent) {
      content.push(parsedCellContent)
    }
  }
  return content
}

function cellContentParser(el) {
  let content = []

  for (let component of el.childNodes) {
    let parsedComponent = distributor(component)

    if (parsedComponent) {
      content.push(parsedComponent)
    }
  }
  return content
}

function expandableDivParser(box) {
  let content = []
  let titleDiv = box.querySelector('.expandable-title')
  if (titleDiv) {
    let title = document.createElement("h4")
    title.innerHTML = titleDiv.textContent
    content.push(title)

    if (titleDiv.nextElementSibling) {
      let disc = titleDiv.nextElementSibling.innerHTML
      let el = document.createElement('p')
      el.innerHTML = `<i>${disc}</i>`
      content.push(el)
    }
  }

  let contentDiv = box.querySelector('.expandable-area')
  for (let child of contentDiv.childNodes) {
    let parsedContent = distributor(child)
    content.push(parsedContent)
  }
  content = content.flat(Infinity)
  return boxGenerator(content, "default")
}

function componentParser(el) {
  let content = []
  for (let child of el.childNodes) {
    let parsedEl = distributor(child)
    if (parsedEl) {
      content.push(parsedEl)
    }
  }
  return content
}

function boxParser(box, color) {
  let children = box.children
  let content = []
  for (let child of children) {
    if (child.classList.contains('article-component')) {
      content.push(componentParser(child))
    }
  }
  content = content.flat()
  let parsedBox = boxGenerator(content, color)
  return parsedBox
}

function boxGenerator(content, color) {
  let box = document.createElement('div')
  box.classList.add("simplebox")
  box.classList.add(`hypo-box-${color}`)
  box.setAttribute("data-box-class", `hypo-box-${color}`)
  
  if (content[0].tagName == "H4") {
    box.setAttribute("data-show-header", "true")
    let title = content.shift()
    title.classList.add("simplebox-title")
    box.appendChild(title)
  }

  let contentDiv = document.createElement('div')
  contentDiv.classList.add('simplebox-content')

  for (let c of content) {
    contentDiv.appendChild(c)
  }
  box.appendChild(contentDiv)
  return box
}

function gcaComponentParser(el) {
  if (el.querySelector('audio')) return gcaAudioComponent()
  if (el.querySelector('.video-embed')) return gcaVideoComponent()
}

function gcaAudioComponent() {
  let el = document.createElement("div")
  el.innerHTML = `<div class="hypo-audio" style="text-align:center"><audio controls="controls" controlslist="nodownload" src="this.data.src"><source src="this.data.src" /></audio></div>`
  el = el.firstElementChild
  return el
}

function gcaVideoComponent() {
  let temp = document.createElement('p')
  temp.innerHTML = "<strong>[insert video here]</strong>"
  return temp
}

function componentHeaderParser(el) {
  let parsedEl = document.createElement('h4')
  let node = distributor(el.firstChild)
  parsedEl.appendChild(node)
  return parsedEl
}

function equationHandler(el) {
  let equation = el.getAttribute('data-mathml')
  equation = Mathml2latex.convert(equation)

  if (equation.substring(0, 13) == "\\left{\\right.") {
    equation = equation.replace("\\left{\\right.", "\\begin{cases}") + "\\end{cases}"
  }
  equation = "\\(" + equation + "\\)"

  let parsedEl = document.createElement('span')
  parsedEl.classList.add('math-tex')
  parsedEl.innerHTML = equation

  return parsedEl
}

function pTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

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

function strongTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  return parsedEl
}

function emTagParser(el) {
  let parsedEl = document.createElement('i')
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  return parsedEl
}

function ulTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  return parsedEl
}

function olTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  return parsedEl
}

function liTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  return parsedEl
}

function blockquoteTagParser(el) {
  let author = el.querySelector('.quote-source')
  if (author) {
    el.removeChild(author)
  }

  let parsedEl = document.createElement(el.tagName)
  let p = document.createElement('p')
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => p.appendChild(node))

  if (author) {
    p.innerHTML = p.innerHTML + '<br><sub>' + author.innerHTML + '</sub>'
  }
  parsedEl.appendChild(p)
  return parsedEl
}

function h4TagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  return parsedEl
}

function spanTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  if (el.classList.contains('blue-text')) {
    parsedEl.style.color = "#0000ff"
  }

  if (el.classList.contains('red-text')) {
    parsedEl.style.color = "#ff0000"
  }

  return parsedEl
}

function tableTagParser(el) {
  let parsedDiv = document.createElement('div')
  parsedDiv.classList.add('table-responsive')
  let parsedTable = document.createElement('table')
  parsedTable.classList.add(['hypo-table-responsive', 'table', 'table-bordered'])

  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedTable.appendChild(node))

  parsedDiv.appendChild(parsedTable)
  return parsedDiv
}

function tbodyTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  return parsedEl
}

function trTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.children) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  return parsedEl
}

function tdTagParser(el) {
  if (el.textContent.trim().length == 0) {
    return
  }
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  let colspan = el.getAttribute('colspan')
  if (colspan) {
    parsedEl.setAttribute('colspan', colspan)
  }

  return parsedEl
}

function thTagParser(el) {
  if (el.textContent.trim().length == 0) {
    return
  }
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  let colspan = el.getAttribute('colspan')
  if (colspan) {
    parsedEl.setAttribute('colspan', colspan)
  }

  return parsedEl
}

function subTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  return parsedEl
}

function figureTagParser(el) {
  let temp = document.createElement('p')
  temp.innerHTML = "<strong>[insert image here]</strong>"
  return temp
}

function imgTagParser(el) {
  let temp = document.createElement('p')
  temp.innerHTML = "<strong>[insert image here]</strong>"
  return temp
}

function divTagParser(el) {
  let parsedEl = document.createElement(el.tagName)
  let nodes = []

  for (let child of el.childNodes) {
    let node = distributor(child)
    if (node) {
      nodes.push(node)
    }
  }

  nodes.forEach(node => parsedEl.appendChild(node))

  return parsedEl
}