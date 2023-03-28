const baseSearchUrl = 'https://api.github.com/search'
const searchResultAutocomplete = 5

window.addEventListener('DOMContentLoaded', () => {
  document
    .querySelector('form')
    .addEventListener('submit', (e) => e.preventDefault())

  input.addEventListener('keyup', inputHandler)
})

function inputHandler(event) {
  searchAndRenderReposDebounced(event.target.value)
}

function clearAutocomplete() {
  autocomplete
    .querySelector('li')
    ?.removeEventListener('click', autocompleteClickHandler)
  autocomplete.innerHTML = ''
  document.querySelector('.error')?.remove()
}

async function searchAndRenderRepos(queryString) {
  if (!queryString.length) {
    clearAutocomplete()
    return
  }
  const url = `${baseSearchUrl}/repositories?q=${queryString}`
  await fetch(url)
    .then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          renderRepos(data.items)
        })
      } else {
        alert(`Something wrong: response code ${response.status}`)
      }
    })
    .catch((err) => {
      console.log(err)
      // alert(`Something wrong: ${er}`)
    })
}

function renderRepos(reposArr) {
  clearAutocomplete()
  if (!reposArr.length) {
    input.insertAdjacentHTML(
      'afterend',
      '<span class="error">No repositories found</span>'
    )
    return
  }

  const fragment = document.createDocumentFragment()

  for (let i = 0; i < searchResultAutocomplete; i++) {
    const liItemElement = document.createElement('li')
    liItemElement.textContent = reposArr[i].full_name
    liItemElement.dataset.repo = JSON.stringify(reposArr[i])
    liItemElement.addEventListener('click', autocompleteClickHandler)
    fragment.appendChild(liItemElement)
  }

  autocomplete.appendChild(fragment)
}

function removeChosenItem(event) {
  event.target.removeEventListener('click', removeChosenItem)
  event.target.closest('li').remove()
}

function addToChosenRepos(repo) {
  const liItemElement = document.createElement('li')

  const nameElement = document.createElement('p')
  nameElement.textContent = `Name: ${repo.full_name}`
  const ownerElement = document.createElement('p')
  ownerElement.textContent = `Owner: ${repo.owner.login}`
  const starsElement = document.createElement('p')
  const stars =
    repo.stargazers_count < 1000
      ? repo.stargazers_count
      : (repo.stargazers_count / 1000).toFixed(1) + 'K'

  const removeButton = document.createElement('button')
  removeButton.textContent = 'DELETE'
  removeButton.addEventListener('click', removeChosenItem)

  starsElement.textContent = `Stars: ${stars}`
  liItemElement.appendChild(nameElement)
  liItemElement.appendChild(ownerElement)
  liItemElement.appendChild(starsElement)
  liItemElement.appendChild(removeButton)

  repoList.prepend(liItemElement)
}

function autocompleteClickHandler(event) {
  const repo = JSON.parse(event.target.dataset.repo)
  input.value = ''

  addToChosenRepos(repo)

  clearAutocomplete()
}

const debounce = (fn, ms) => {
  let timer
  return function () {
    clearTimeout(timer)

    timer = setTimeout(() => {
      fn.call(this, ...arguments)
    }, ms)
  }
}

const searchAndRenderReposDebounced = debounce(searchAndRenderRepos, 400)
