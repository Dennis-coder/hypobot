const Mathml2latex = require('mathml-to-latex');

export function parser(html) {
  let main = document.createElement('div')
  main.innerHTML = html
  let content = []

  let pages = main.querySelectorAll('.article-page')
  if (pages.length == 0) {
    pages = [main]
  }

  for (let page of pages) {
    let parsedPage = pageParser(page)
    content.push(parsedPage)
  }

  content = content.flat(Infinity)
  let temp = document.createElement('div')
  for (let el of content) {
    temp.appendChild(el)
  }
  
  return temp.innerHTML
}

function pageParser(page) {
  let cells = page.querySelectorAll('.cell:not(.cell-empty) .cell-content')
  let content = []

  if (cells.length == 0) {
    cells = [page]
  }

  for (let cell of cells) {
    content.push(cellParser(cell))
  }
  return content
}

function cellParser(cell) {
  let content = []
  let parsedComponent = null
  let components = cell.children

  if (components.length == 0) {
    components = [cell]
  }

  for (let component of components) {
    if (component.classList.contains('article-component')) {
      parsedComponent = componentParser(component)
    } else if (component.classList.contains('expandable')) {
      parsedComponent = expandableDivParser(component)
    } else {
      parsedComponent = distributor(component)
    }
    if (parsedComponent) {
      content.push(parsedComponent)
    }
  }
  return content
}

function expandableDivParser(box) {
  let content = []
  let title = document.createElement("h4")
  let titleDiv = box.querySelector('.expandable-title')
  title.innerHTML = titleDiv.textContent
  content.push(title)
  if (titleDiv.nextElementSibling) {
    let disc = titleDiv.nextElementSibling.innerHTML
    let el = document.createElement('p')
    el.innerHTML = `<i>${disc}</i>`
    content.push(el)
  }
  let component = box.querySelector('.article-component')
  let parsedComponent = componentParser(component)
  content.push(parsedComponent)
  content = content.flat(Infinity)
  return boxGenerator(content, "default")
}

function componentParser(component) {
  if (component.classList.contains('box-summary')) {
    return boxParser(component, 'olive')
  } else if (component.classList.contains('box-standard')) {
    return boxParser(component, 'default')
  } else if (component.classList.contains('box-help')) {
    return boxParser(component, 'yellow')
  } else if (component.classList.contains('box-practice')) {
    return boxParser(component, 'blue')
  } else if (component.classList.contains('box-example')) {
    return boxParser(component, 'pink')
  } else {
    let content = []
    for (let child of component.children) {
      if (child.classList.contains('article-component')) {
        content.push(componentParser(child))
      } else if (child.classList.contains('gca-component')) {
        content.push(audioComponent())
      } else if (child.classList.contains('questbox')) {
        return null
      } else {
        let parsedEl = distributor(child)
        if (parsedEl) {
          content.push(parsedEl)
        }
      }
    }
    return content
  }
}

function audioComponent() {
  let el = document.createElement("div")
  el.innerHTML = `<div class="hypo-audio" style="text-align:center"><audio controls="controls" controlslist="nodownload" src="this.data.src"><source src="this.data.src" /></audio></div>`
  el = el.firstElementChild
  return el
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

function distributor(el) {
  if (el.tagName == undefined) {
    return el
  }
  if (el.classList.contains('htmlcomponent-header')) {
    return componentHeaderParser(el)
  }
  if (el.classList.contains('mjx-chtml')) {
    return equationHandler(el)
  }
  switch (el.tagName) {
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
  }
}

function boxGenerator(content, color) {
  let box = document.createElement('div')
  box.classList.add("simplebox")
  box.setAttribute("data-show-header", "true")
  box.classList.add(`hypo-box-${color}`)
  box.setAttribute("data-box-class", `hypo-box-${color}`)

  let title = document.createElement('h4')
  if (content[0].tagName == "H4") {
    title = content.shift()
  }
  title.classList.add("simplebox-title")
  box.appendChild(title)

  let contentDiv = document.createElement('div')
  contentDiv.classList.add('simplebox-content')

  for (let c of content) {
    contentDiv.appendChild(c)
  }
  box.appendChild(contentDiv)
  return box
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

    if (el.classList.contains('text-small')) {
      parsedEl.innerHTML = '<sub>' + parsedEl.innerHTML + '</sub>'
    }

    if (el.classList.contains('underline')) {
      parsedEl.innerHTML = '<u>' + parsedEl.innerHTML + '</u>'
    }

    if (el.classList.contains('indent')) {
      parsedEl.classList.add('hypo-text-indent')
    }

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
    parsedEl.style = `color:#000080;`
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