export default function taskChecker(task) {

    if (!task || typeof task !== 'object') {
        return 'Invalid task object : correct format is {task : < your-task >}'
    }

    if (!task.url || typeof task.url !== 'string') {
        return 'Invalid or missing "url" in task';
    }

    const requiredParams = task.url.match(/{{(.*?)}}/g) || []
    for (const requiredParam of requiredParams) {
        const paramName = requiredParam.replace(/{{|}}/g, '')
        if (!task.params || !task.params[paramName]) {
            return `Required parameter ${paramName} not provided for URL `
        }
        /* if (!task.params[paramName].name || typeof task.params[paramName].name !== 'string') {
            return `name provided for parameter ${paramName} is not valid`
        } */

        if((!task.params[paramName].default || typeof task.params[paramName].default !== 'string') && (!task.params[paramName].value || typeof task.params[paramName].value !== 'string') ){
            return `No Value (or) DefaultValue provided for ${paramName}`
        }

        if (task.params[paramName].value && typeof task.params[paramName].value !== 'string') {
            return `value provided for parameter ${paramName} is not valid`
        }
    }

    for (const paramName in task.params) {
        if (task.params.hasOwnProperty(paramName)) {
            if (!requiredParams.includes(`{{${paramName}}}`)) {
                console.log(`Parameter "${paramName}" in "params" is not used in the URL: ${task.url}`)

            }
        }
    }

    if (!Array.isArray(task.selectors) || task.selectors.length === 0) {
        return 'Invalid or missing "selectors" in task'
    }

    for (const selectorInfo of task.selectors) {
        if (!selectorInfo || typeof selectorInfo !== 'object') {
            return 'Invalid selector detected'
        }

        if (!selectorInfo.name || typeof selectorInfo.name !== 'string') {
            return 'Selector must have a non-empty "name" of type "string"'
        }
        if (!selectorInfo.selector || typeof selectorInfo.selector !== 'string') {
            return `Selector with name ${selectorInfo.name} must have a non-empty "selector" of type "string"`
        }
        if (!selectorInfo.format || typeof selectorInfo.format !== 'string') {
            return `Selector with name ${selectorInfo.name} must have a non-empty "format" of type "string"`
        }
        if (!(selectorInfo.format == 'single' || selectorInfo.format == 'multiple')) {
            return `Selector with name ${selectorInfo.name} must only have a format value of either "single" or "array" `
        }
        if (!selectorInfo.target || typeof selectorInfo.target !== 'string') {
            return `Selector with name ${selectorInfo.name} must have a non-empty "target" of type "string"`
        }
    }

    if (!task.taskOptions || typeof task.taskOptions !== 'object') {
        return 'Invalid or missing Task Options'
    }

    if (!task.taskOptions.format || typeof task.taskOptions.format !== 'string') {
        return 'TaskOptions format is Invalid'
    }

    if (!(task.taskOptions.format == 'separate' || task.taskOptions.format == 'together')) {
        return 'TaskOptions format must only be either "seperate" or "together"'
    }

    if (task.taskOptions.format == 'together') {

        if ((!task.taskOptions.parentElementSelector || typeof task.taskOptions.parentElementSelector !== 'string')) {
            return 'TaskOptions\'s format is "Together" but ParentElementSelecotr is either Invalid or missing'
        }

        if ((!task.taskOptions.dataOrder || !Array.isArray(task.taskOptions.dataOrder))) {
            return 'TaskOptions\'s DataOrder is not valid while taskOptions.format is "together"'
        }

        
        for(const data of task.taskOptions.dataOrder){
            let found = false
            for(const selector of task.selectors){
                if(selector.name == data){
                    found = true
                    break
                }
            }
            if(!found){
                return `No selector found with name ${data}, Please Check Data Order or create a selector with name ${data}`
            }
        }

        for (const selector of task.selectors) {
            if (selector.format === 'single') {
                return `Invalid format for selector with name ${selector.name}, selctor cant have a format of "Single" while TaskOptions is "Together"`
            }
        }

    }

    if (task.taskOptions.waitForSelector && typeof task.taskOptions.waitForSelector !== 'string') {
        return 'Invalid waitForSelector'
    }

    return 'task is valid'
}

/* const task = {
    "url": "{{base_url}}/?s={{search_text}}",
    "params": {
        "base_url": {
            "value": "https://fitgirl-repacks.site",
            "required": true
        },
        "search_text": {
            "value": "hitman",
            "default": "Avengers",
            "required": true
        }
    },
    "selectors": [
        {
            "name": "title",
            "format": "multiple",
            "target": "innerText",
            "selector": ".entry-header > .entry-title > a"
        },
        {
            "name": "desc",
            "format": "multiple",
            "target": "innerText",
            "selector": ".entry-summary > p"
        },
        {
            "name": "uploaded_on",
            "format": "multiple",
            "target": "innerText",
            "selector": ".entry-header > .entry-meta > .entry-date > a > time"
        },
        {
            "name": "details_page_link",
            "format": "multiple",
            "target": "href",
            "selector": ".entry-header > .entry-title > a"
        }
    ],
    "taskOptions": {
        "format": "together",
        "waitForSelector": "#primary",
        "parentElementSelector": "#primary > .site-content > article",
        "dataOrder": [
            "title",
            "desc",
            "uploaded_on",
            "details_page_link"
        ]
    }
}
console.log(taskChecker(task)) */
