export function parser(html) {
  let main = document.createElement('div')
  main.innerHTML = html
  let pages = main.querySelectorAll('.article-page')
  let content = []
  for (let page of pages) {
    content.push(pageParser(page))
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
  for (let cell of cells) {
    content.push(cellParser(cell))
  }
  return content
}

function cellParser(cell) {
  let content = []
  for (let component of cell.children) {
    if (component.classList.contains('article-component')) {
      content.push(componentParser(component))
    } else if (component.classList.contains('expandable')) {
      content.push(expandableDivParser(component))
    }
  }
  return content
}

function componentParser(component) {
  if (component.classList.contains('box-summary')) {
    return boxParser(component, 'olive')
  } else if (component.classList.contains('box-standard')) {
    return boxParser(component, 'default')
  } else {
    let content = []
    for (let child of component.children) {
      if (child.classList.contains('article-component')) {
        content.push(componentParser(child))
      } else if (child.classList.contains('gca-component')) {
        content.push(audioComponent())
      } else {
        parsedEl = distributor(child)
        if(parsedEl) {
          content.push(parsedEl)
        }
      }
    }
    return content
  }
}

function distributor(el) {
  let parsedEl = null
  switch (el.tagName) {
    case "P":
      parsedEl = pTagParser(el)
      break
    case "STRONG":
      parsedEl = pTagParser(el)
      break
    case "EM":
      parsedEl = pTagParser(el)
      break
    case "UL":
      parsedEl = listTagParser(el)
      break
    case "OL":
      parsedEl = listTagParser(el)
      break
    case "BLOCKQUOTE":
      parsedEl = blockquoteParser(el)
      break
    case "TABLE":
      parsedEl = tableParser(el)
      break
    case "H4":
      parsedEl = h4TagParser(el)
      break
  }
  return parsedEl
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

function pTagParser(p) {
  if (p.textContent.trim().length == 0) {
    return null
  }
  let el = null
  let isH4 = p.classList.contains('title-2') || p.classList.contains('title-3') || p.classList.contains('ingress')
  if (isH4) {
    el = document.createElement("h4")
    el.appendChild(document.createTextNode(p.textContent))
  } else if (Array.from(p.children).some(c => c.tagName == "IMG")) {
    el = document.createElement("p")
    el.innerHTML = "<strong>insert image here</strong>"
  } else {
    el = document.createElement("p")
    let html = p.innerHTML
    html = html.replaceAll(`class="blue-text"`, `style="color:#000080;"`).replaceAll(` lang="sv_se"`, "").replaceAll('<em>', '<i>').replaceAll('</em>', '</i>').replaceAll('&nbsp;', ' ')
    if (p.classList.contains('text-small')) {
      html = '<sub>' + html + '</sub>'
    }
    if (p.classList.contains('underline')) {
      html = '<u>' + html + '</u>'
    }
    el.innerHTML = html

    if (p.classList.contains('indent')) {
      el.classList.add('hypo-text-indent')
    }

  }
  return el
}

function listTagParser(ul) {
  return ul
}

function blockquoteParser(bq) {
  let author = bq.lastElementChild
  bq.removeChild(author)
  let parsedBq = document.createElement('blockquote')
  let p = document.createElement('p')
  p.innerHTML = bq.innerHTML + '<br><sub>' + author.innerHTML + '</sub>'
  parsedBq.appendChild(p)
  return parsedBq
}

function audioComponent() {
  el = document.createElement("div")
  el.innerHTML = `<div class="hypo-audio" style="text-align:center"><audio controls="controls" controlslist="nodownload" src="this.data.src"><source src="this.data.src" /></audio></div>`
  el = el.firstElementChild

  return el
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

function h4TagParser(h4) {
  let el = document.createElement('h4')
  el.innerHTML = h4.firstChild.textContent
  return el
}

function tableParser(table) {
  let div = document.createElement('div')
  div.classList.add('table-responsive')
  let newTable = document.createElement('table')
  newTable.classList.add(['hypo-table-responsive', 'table', 'table-bordered'])
  let newTBody = document.createElement('tbody')
  for (let row of table.querySelectorAll('tr')) {
    let newRow = document.createElement('tr')

    for (let col of row.children) {
      if (col.textContent.trim().length == 0) {
        continue
      }
      let newCol = document.createElement(col.tagName)

      newCol.innerHTML = col.innerHTML

      let colspan = col.getAttribute('colspan')
      if (colspan) {
        newCol.setAttribute('colspan', colspan)
      }
      newRow.appendChild(newCol)
    }

    if (newRow.firstChild) {
      newTBody.appendChild(newRow)
    }
  }

  newTable.appendChild(newTBody)
  div.appendChild(newTable)
  return div
}