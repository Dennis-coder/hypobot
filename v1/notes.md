# Teori

## Titel

Ligger i en <h1 class="cover-titel">

exempel:

<div class="cover">
    <div class="cover-image">
        <img class="" src="/uploads/15/covers/vinj_huvu_notguilty.jpg" alt="">
    </div>
    <h1 class="cover-title">1. Not Guilty</h1>
</div>


## Innehåll

Ligger i en <section class="article-section">...</section>

Varje sådan har en titel som ligger i en <h2> eller <h3>

Själva texten ligger sedan i en <div class="article-content">...</div>

Varje sådan har x antal olika sidor som ligger i <div data-pagenr="1" class="article-page">...</div>

Varje sida är i sin tur uppbyggt av flera cell-grupper <div class="cell-group clearfix">...</div>

Varje cell-grupp består av x antal celler <div class="cell cell-{size}">...</div>
cell-large är huvudinnehållet
cell-small är sidoinnehåll, lägger sig i en column vid sidan av i större upplösningar

Varje cell har en <div class="cell-content">...</div>

Varje sådan har x antal komponenter <div class="article-component {box-summary}">...</div>
Dessa komponenter kan ha klasser så som box-summary och ger komponenten en bakgrundsfärg
box-summary => ljusgrön

Varje komponent har sedan ytterliggare en komponent med det faktiska innehållet <div class="article-component">...</div>

De komponenterna har sedan respektive innehåll


# Algoritmen

index.html - html koden som ska översättas
temp.html - tempfil för eventuell formatering av resultatet
notes.md - anteckningar kring projektet
test.js - algoritmfilen