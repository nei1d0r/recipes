window.onload = async () => {
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
        $navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {
                const target = el.dataset.target
                const $target = document.getElementById(target)

                el.classList.toggle('is-active')
                $target.classList.toggle('is-active')
            });
        });
    }

    // CLIENT SIDE PASSWORD MATCH VALIDATION
    if (!!document.getElementById('password2')) {
        document.addEventListener('keyup', (e) => {
            if (document.getElementById('password').value ==
            document.getElementById('password2').value) {
            document.getElementById('message').style.color = 'green';
            document.getElementById('message').innerHTML = 'matching';
            } else {
            document.getElementById('message').style.color = 'red';
            document.getElementById('message').innerHTML = 'not matching';
            }
        })
    }

    // set file upload event from DOM
    // quick check to see if we need to load script
    !!!document.getElementById('file') ? console.log('NOT /ingredients/add')
        : document.getElementById('file').addEventListener('change', async (e) => {
            
            const labelDiv = document.getElementById('foodLabels')
            const loader = document.createElement('p')
            loader.setAttribute('class', 'label has-text-centered')
            loader.setAttribute('for', 'expiryDate')
            loader.innerHTML += '...Loading'
            labelDiv.appendChild(loader)
            
            const file = event.srcElement.files[0]
            // Convert file to base64 in order to send to server for labelling
            const fileToBase64 = async (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.readAsDataURL(file)
                    reader.onload = () => resolve(reader.result)
                    reader.onerror = (e) => reject(e)
                })
                    .then(async (base64Image) => {
                        return await fetch('./identify-food', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ image: base64Image })
                        })
                            .then(async (res) => {
                                return res.json()
                                // hide spinner?
                            })
                    })
                    .catch((err) => {
                        console.debug(err.message)
                    })

            await fileToBase64(file).then((labels) => {
                let labelDiv = document.getElementById('foodLabels')
                labelDiv.setAttribute('class', 'labelDiv container-fluid has-text-centered')

                // overwrites the existing form when image is changed
                while (labelDiv.firstChild) {
                    labelDiv.removeChild(labelDiv.firstChild);
                }

                // make form element
                const form = document.createElement('form')
                form.setAttribute('class', 'formBody container has-text-centered')
                form.setAttribute('id', 'labelForm')
                form.setAttribute('name', 'form')
                form.setAttribute('method', 'POST')
                form.setAttribute('action', './')

                //  Make first div    
                const ingredientDiv = document.createElement('div')
                ingredientDiv.setAttribute('class', 'labelGroup form-group has=text-centered')

                labels.forEach(ingredient => {
                    //  Make label
                    const label = document.createElement('label')
                    label.setAttribute('class', 'foodLabel button is-variable')
                    label.setAttribute('for', ingredient)
                    label.innerHTML += ingredient

                    label.addEventListener('click', (event) => {
                        const radioLabels = event.target.parentElement.querySelectorAll('label')

                        radioLabels.forEach((button) => {
                            button.classList.remove('is-focused')
                            button.classList.remove('is-info')
                            button.classList.remove('is-light')
                            button.classList.add('is-outline')
                        })
                        // change class to focused
                        event.target.setAttribute('class', 'foodLabel button is-focused is-info is-light')
                    })

                    //  Make input
                    const input = document.createElement('input')
                    input.setAttribute('id', ingredient)
                    input.setAttribute('value', ingredient)
                    input.setAttribute('type', 'radio')
                    input.setAttribute('name', 'label')
                    input.setAttribute('required', 'required')

                    input.style.display = 'none'

                    //  Attach elements
                    ingredientDiv.appendChild(input)
                    ingredientDiv.appendChild(label)
                })
                // EXPIRY DATE---------------------------------------------
                const expiryDiv = document.createElement('div')

                const dateLabel = document.createElement('label')
                dateLabel.setAttribute('class', 'label')
                dateLabel.setAttribute('for', 'expiryDate')
                dateLabel.innerHTML += 'Expiry Date'

                const dateInput = document.createElement('input')
                dateInput.setAttribute('class', 'input is-small')
                dateInput.setAttribute('type', 'date')
                dateInput.setAttribute('id', 'expiryDate')
                dateInput.setAttribute('name', 'expiryDate')
                dateInput.setAttribute('required', 'required')

                expiryDiv.appendChild(dateLabel)
                expiryDiv.appendChild(dateInput)
                // QUANTITY ---------------------------------------------
                const QuantityDiv = document.createElement('div')

                const QuantityLabel = document.createElement('label')
                QuantityLabel.setAttribute('class', 'label')
                QuantityLabel.setAttribute('for', 'quantity')
                QuantityLabel.innerHTML += 'Quantity'

                const QuantityInput = document.createElement('input')
                QuantityInput.setAttribute('type', 'number')
                QuantityInput.setAttribute('min', '1')
                QuantityInput.setAttribute('max', '24')
                QuantityInput.setAttribute('class', 'input is-small')
                QuantityInput.setAttribute('id', 'quantity')
                QuantityInput.setAttribute('name', 'quantity')
                QuantityInput.setAttribute('required', 'required')
                // SET MIN MAX VALUES

                QuantityDiv.appendChild(QuantityLabel)
                QuantityDiv.appendChild(QuantityInput)
                // STORAGE LOCATION ---------------------------------------------
                const locationDiv = document.createElement('div')
                const storageOptions = ['Fridge', 'Freezer', 'Cupboard']

                const storageLabel = document.createElement('label')
                storageLabel.setAttribute('class', 'label')
                storageLabel.setAttribute('for', 'storageList')
                storageLabel.innerHTML += 'Storage Location'

                const storageList = document.createElement('input')
                storageList.setAttribute('id', 'storageList')
                storageList.setAttribute('class', 'input is-small')
                storageList.setAttribute('name', 'location')
                storageList.setAttribute('list', 'location')
                storageList.setAttribute('required', 'required')

                const dataList = document.createElement('datalist')
                dataList.setAttribute('id', 'location')

                storageList.appendChild(dataList)

                storageOptions.forEach(item => {
                    let option = document.createElement('option')
                    option.setAttribute('value', item)
                    dataList.appendChild(option)
                })

                locationDiv.appendChild(storageLabel)
                locationDiv.appendChild(storageList)

                // SUBMIT BUTTON ---------------------------------------------
                const submitDiv = document.createElement('div')

                const submitButton = document.createElement('input')
                submitButton.setAttribute('class', 'submitItem button is-medium is-fullwidth is-info is-light')
                submitButton.setAttribute('type', 'submit')
                submitButton.setAttribute('id', 'submit')
                submitButton.setAttribute('value', 'Add Item to Inventory')

                submitDiv.appendChild(submitButton)

                // APPEND FORM ELEMENTS TO FORM
                form.appendChild(ingredientDiv)
                form.appendChild(expiryDiv)
                form.appendChild(QuantityDiv)
                form.appendChild(locationDiv)
                form.appendChild(submitDiv)

                // TODO - CURRENTLY RETURNING... { label: 'on', expiryDate: '2020-08-22', quantity: '1' }

                const text = document.createTextNode('Please select the best description for your ingredient...')

                labelDiv.appendChild(text)
                labelDiv.appendChild(form)
            })
                .catch((err) => {
                    console.log(err)
                })
        })

    if (!document.getElementById('ingredientsAdded')) {
        console.log('NOT /ingredients')
    } else {
        const article = document.getElementById('ingredientsAdded')
        const message = document.getElementById('message')
        document.getElementById('delete').addEventListener('click', (e) => {
            article.remove()
            message.remove
        })
    }
}
