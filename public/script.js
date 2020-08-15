window.onload = async () => {
    // set file upload event from DOM
    document.getElementById('file').addEventListener('change', async (e) => {
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
                    body: JSON.stringify({image: base64Image})
                })
                .then(async (res) => {
                    return res.json()
                })
            })
            .catch((err) => {
                console.debug(err.message)
            })

        await fileToBase64(file).then((labels) => {
            const labelDiv = document.getElementById('foodLabels')

                // TODO - if labelDiv then remove it, otherwise we get duplicate forms when changing image

                // make form element
                const form = document.createElement('form')
                form.setAttribute('id', 'labelForm')
                form.setAttribute('name', 'form')
                form.setAttribute('method', 'POST')
                form.setAttribute('action', './')

                    //  Make first div    
                    const ingredientDiv = document.createElement('div')
                    ingredientDiv.setAttribute('class','form-group')
                    labels.forEach(ingredient => {                
                        //  Make label
                        const label = document.createElement('label')
                            label.setAttribute('for', ingredient)
                            label.setAttribute('class','col-sm-3 control-label input-sm')
                            label.innerHTML += ingredient
                    
                        //  Make input
                        const input = document.createElement('input')
                            input.setAttribute('id', ingredient)
                            input.setAttribute('type', 'radio')
                            input.setAttribute('name', 'label')
                            input.setAttribute('class', 'form-control input-sm')
                            input.setAttribute('required','required')
                        
                        //  Attach elements
                        ingredientDiv.appendChild(input)
                        ingredientDiv.appendChild(label)
                    })
                    // EXPIRY DATE---------------------------------------------
                    const expiryDiv = document.createElement('div')

                    const dateLabel = document.createElement('label')
                    dateLabel.setAttribute('for','expiryDate')
                    dateLabel.setAttribute('class','col-sm-3 control-label input-sm')
                    dateLabel.innerHTML += 'Expiry Date'

                    const dateInput = document.createElement('input')
                    dateInput.setAttribute('type', 'date')
                    dateInput.setAttribute('id', 'expiryDate')
                    dateInput.setAttribute('name', 'expiryDate')
                    
                    expiryDiv.appendChild(dateLabel)
                    expiryDiv.appendChild(dateInput)
                    // QUANTITY ---------------------------------------------
                    const QuantityDiv = document.createElement('div')

                    const QuantityLabel = document.createElement('label')
                    QuantityLabel.setAttribute('for','quantity')
                    QuantityLabel.setAttribute('class','col-sm-3 control-label input-sm')
                    QuantityLabel.innerHTML += 'Quantity'

                    const QuantityInput = document.createElement('input')
                    QuantityInput.setAttribute('type', 'number')
                    QuantityInput.setAttribute('id', 'quantity')
                    QuantityInput.setAttribute('name', 'quantity')
                    // SET MIN MAX VALUES
                    
                    QuantityDiv.appendChild(QuantityLabel)
                    QuantityDiv.appendChild(QuantityInput)
                    // STORAGE LOCATION ---------------------------------------------
                    const locationDiv = document.createElement('div')
                    const storageOptions = ['Fridge', 'Freezer', 'Cupboard']

                    const storageLabel = document.createElement('label')
                    storageLabel.setAttribute('for','storageList')
                    storageLabel.setAttribute('class','col-sm-3 control-label input-sm')
                    storageLabel.innerHTML += 'Storage Location'

                    const storageList = document.createElement('input')
                    storageList.setAttribute('id', 'storageList')
                    storageList.setAttribute('list', 'location')

                        const dataList = document.createElement('datalist')
                        dataList.setAttribute('id','location')
                        dataList.setAttribute('class','col-sm-3 control-label input-sm')
                        dataList.innerHTML += 'Storage Location'  

                        storageList.appendChild(dataList)

                        storageOptions.forEach(item => {
                            let option = document.createElement('option')
                            option.setAttribute('value', item)
                            dataList.appendChild(option)
                        })
                    
                    locationDiv.appendChild(storageLabel)
                    locationDiv.appendChild(storageList)

                    // QUANTITY ---------------------------------------------
                    const submitDiv = document.createElement('div')

                    // QuantityLabel.innerHTML += 'Quantity'

                    const submitButton = document.createElement('input')
                    submitButton.setAttribute('type', 'submit')
                    submitButton.setAttribute('id', 'submit')
                    
                    submitDiv.appendChild(submitButton)
                
                // APPEND FORM ELEMENTS TO FORM
                form.appendChild(ingredientDiv)
                form.appendChild(expiryDiv)
                form.appendChild(QuantityDiv)
                form.appendChild(locationDiv)
                form.appendChild(submitDiv)

                // TODO - CURRENTLY RETURNING... { label: 'on', expiryDate: '2020-08-22', quantity: '1' }

            labelDiv.appendChild(form)
        })
    })
}
