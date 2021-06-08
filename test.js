function pagesHandler(contentDiv) {
  let content = document.createElement('div')
  let pages = contentDiv.children

  for (let page of pages) {
    let cellGroups = page.children

    for (let cellGroup of cellGroups) {
      let cells = cellGroup.children

      for (let cell of cells) {
        if (cell.classList.contains('cell-empty')) {
          continue
        }
        let cellContent = cell.firstElementChild
        let componentBoxes = cellContent.children

        for (let temp of componentsHandler(componentBoxes)) {
          if (temp) {
            content.appendChild(temp)
          }
        }
      }
    }
  }
  return content
}

function componentsHandler(componentBoxes) {
  let outContents = []
  for (componentBox of componentBoxes) {
    if (componentBox.classList.contains('expandable')) {
      let content = expandableDivHandler(componentBox)
      box = boxGenerator(content)
      box.classList.add("hypo-box-default")
      box.setAttribute("data-box-class", "hypo-box-default")
      outContents.push(box)
      continue
    }
    let componentContent = componentBox.firstElementChild
    let contents = componentContent.children

    let newContents = contentsHandler(contents)

    if (componentBox.classList.length > 1) {
      let box = boxGenerator(newContents)

      if (componentBox.classList.contains('box-summary')) {
        box.classList.add("hypo-box-olive")
        box.setAttribute("data-box-class", "hypo-box-olive")
      } else {
        box.classList.add("hypo-box-default")
        box.setAttribute("data-box-class", "hypo-box-default")
      }

      outContents.push(box)
    } else {
      newContents.forEach(c => outContents.push(c))
    }
  }
  return outContents
}

function contentsHandler(contents) {
  let newContents = []
  for (let content of contents) {
    switch (content.tagName) {
      case "P":
        newContents.push(pTagHandler(content))
        break
      case "UL":
        newContents.push(listHandler(content))
        break
      case "DIV":
        newContents.push(divHandler(content))
        break
      default:
        console.log(content)
    }
  }
  return newContents
}

function pTagHandler(content) {
  let el = null
  let isH4 = content.classList.contains('title-2') || content.classList.contains('ingress')
  if (isH4) {
    el = document.createElement("h4")
    el.appendChild(document.createTextNode(content.textContent))
  } else if (Array.from(content.children).some(c => c.tagName == "IMG")) {
    el = document.createElement("p")
    el.innerHTML = "<strong>insert image here</strong>"
  } else {
    el = document.createElement("p")
    let html = content.innerHTML
    html = html.replaceAll('<em>', '<i>').replaceAll('</em>', '</i>')
    if (content.classList.contains('text-small')) {
      html = '<sub>' + html + '</sub>'
    }
    el.innerHTML = html

    if (content.classList.contains('indent')) {
      el.classList.add('hypo-text-indent')
    }

  }
  return el

}

function listHandler(content) {
  return content
}

function divHandler(content) {
  let el = null
  if (content.classList.contains('gca-component-content')) {
    el = document.createElement("p")
    el.innerHTML = `<div class="hypo-audio" style="text-align:center"><audio controls="controls" controlslist="nodownload" src="this.data.src"><source src="this.data.src" /></audio></div>`
    el = el.firstElementChild
  } else {
    console.log(content)
  }
  return el
}

function expandableDivHandler(box) {
  let content = []
  let title = document.createElement("h4")
  title.appendChild(document.createTextNode(box.querySelector('.expandable-title').textContent))
  content.push(title)
  if (box.querySelector('.expandable-title').nextElementSibling) {
    let disc = box.querySelector('.expandable-title').nextElementSibling
    let el = document.createElement('p')
    el.innerHTML = `<i>${disc.innerHTML}</i>`
    content.push(el)
  }
  let texts = box.querySelector('.article-component').firstElementChild.innerHTML.replaceAll(`class="blue-text"`, `style="color:#000080;"`).replaceAll(` lang="sv_se"`, "").replaceAll('<em>', '<i>').replaceAll('</em>', '</i>')
  let el = document.createElement('p')
  el.innerHTML = texts
  content.push(el)  
  return content
}

function boxGenerator(content) {
  let box = document.createElement('div')
  box.classList.add("simplebox")
  box.setAttribute("data-show-header", "true")

  let title = content.shift()
  title.classList.add("simplebox-title")

  box.appendChild(title)
  contentDiv = document.createElement('div')
  contentDiv.classList.add('simplebox-content')

  for (let c of content) {
    contentDiv.appendChild(c)
  }
  box.appendChild(contentDiv)
  return box
}

function copyToClipboard() {
  // let section = document.querySelector('.article-section')
  // let title = {}
  // if (section.children.length >= 2) {
  //   title.text = section.firstElementChild.textContent
  //   title.type = section.firstElementChild.tagName
  //   title.classes = section.firstElementChild.classList
  // }

  let contentDiv = document.querySelector('.article-content')
  let content = pagesHandler(contentDiv)
  
  let copy = document.createElement('textarea')
  copy.value = content.innerHTML ? content.innerHTML : "No html"
  copy.setAttribute('readonly', '')
  document.body.appendChild(copy)
  copy.select()
  document.execCommand('copy')
  document.body.removeChild(copy)
  alert('Copied text to clipboard')
}
