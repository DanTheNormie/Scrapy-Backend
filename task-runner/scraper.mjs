import taskChecker from "./taskChecker.mjs"
import { Cluster } from "puppeteer-cluster"


const replaceURLParams = (url, params) => {

    return url.replace(/{{(.*?)}}/g, (match, paramName) => {
        if (params.get(paramName).value) {
            return params.get(paramName).value
        }
        return params.get(paramName).default || ""
    })
}

const getActiveSelectors = (selectors, dataOrder) => {
    return selectors.filter((s) => dataOrder.includes(s.name))
}

const scrapeSelectorTogether = async (page, selectors, parentElementSelector) => {
    const pageFunction = (elements, selectors) => {
        /* elements = Array.from(querySelectorAll(parentElementSelector)) */
        /* selectors is the last param passed from page.$$eval() */

        if (!elements || elements.length == 0) {
            throw new Error('No data Found for given ParentElementSelector')
        }

        return elements.map((parentElement) => {
            const result = {};

            for (const selectorItem of selectors) {
                const { name, target, selector } = selectorItem
                const element = parentElement.querySelector(selector)

                if (element !== null) {
                    if (target == 'innerText') {
                        result[name] = element.innerText
                    } else if (target == 'innerHTML') {
                        result[name] = element.innerHTML
                    } else if (element.hasAttribute(target)) {
                        result[name] = element.getAttribute(target)
                    }

                    if (!result[name] || result[name] == '' || result[name].length < 1) {
                        result[name] = 'No Data Found'
                    }
                } else {
                    result[name] = 'No Data Found'
                }

            }

            return result
        })
    }

    try {
        const result = await page.$$eval(parentElementSelector, pageFunction, selectors)
        return result
    } catch (e) {
        console.error('Failed to scrape data Together');
        throw e
    }
}

const scrapeSelectorsIndividually = async (page, selectors) => {
    

    const pageFnForMultiple = (elements, target) => {

        return elements.map((element) => {
            let result
            if (element !== null) {
                if (target == 'innerText') {
                    result = element.innerText
                } else if (target == 'innerHTML') {
                    result = element.innerHTML
                } else if (element.hasAttribute(target)) {
                    result = element.getAttribute(target)
                }

                if (!result || result == '' || result.length < 1 || result == null) {
                    result = 'No Data Found'
                }
            } else {
                result = 'No Data Found'
            }
        })
    }

    const pageFnForSingle = (element, target) => {

        let result
        if (element !== null) {
            if (target == 'innerText') {
                result = element.innerText
            } else if (target == 'innerHTML') {
                result = element.innerHTML
            } else if (element.hasAttribute(target)) {
                result = element.getAttribute(target)
            }

            if (!result || result == '' || result.length < 1) {
                result = 'No Data Found'
            }
        } else {
            result = 'No Data Found'
        }
        return result
    }

    const result = {}
    for (const selectorItem of selectors) {
        const { name, selector, target, format } = selectorItem

        try {
            if (format === 'multiple') {
                result[name] = await page.$$eval(selector, pageFnForMultiple, target)
            } else {
                result[name] = await page.$eval(selector, pageFnForSingle, target)
            }
        } catch (err) {
            console.error(err);
            throw new Error(`Error While evaluating selector with name ${name}`)
        }
    }
    return result
}


export const taskRunner = async ({page, data}) => {

    const task = data

    const url = replaceURLParams(task.url, task.params)

    task.selector = getActiveSelectors(task.selectors, task.taskOptions.dataOrder)

    console.log('Processing URL : ', url, '\n\n');


    try {
        await page.goto(url)
    } catch (e) {
        console.error(e);
        throw new Error(`Couldn't go to url : ${url}`)
    }

    if (task.taskOptions.waitForSelector) {
        try {
            await page.waitForSelector(task.taskOptions.waitForSelector)
        } catch (e) {
            console.error(e);
            throw new Error('Page didn\'t load as expected');
        }
    } else {
        if (task.taskOptions.format == 'together') {
            try {
                await page.waitForSelector(task.taskOptions.parentElementSelector)
            } catch (e) {
                console.error(e);
                throw new Error('Couldn\'t find any matching Element for ParentElementSelector in the page')
            }
        } else {
            try {
                await page.waitForSelector(task.selectors[0].selector)
            } catch (e) {
                console.error(e)
                throw new Error('Couldn\'t find any matching Element for the First Selector')
            }
        }
    }

    let result;
    try {
        if (task.taskOptions.format == "together") {
            result = await scrapeSelectorTogether(page, task.selectors, task.taskOptions.parentElementSelector)
        } else {
            result = await scrapeSelectorsIndividually(page, task.selectors)
        }
    } catch (e) {
        throw e
    }
    return result
}

/* (async () => {
    const task = {
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

    const msg = taskChecker(task)
    
    if (msg == 'task is valid') {

        let cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_PAGE,
            maxConcurrency: 6,
            puppeteerOptions: {
                headless: false
            }
        })

        try{
            cluster.execute(task, scrape)
            
            cluster.execute(task, scrape)
            
            cluster.execute(task, scrape)
            
            cluster.execute(task, scrape)
            
            cluster.execute(task, scrape)
            
            cluster.execute(task, scrape)

            await cluster.idle()
            await cluster.close()
            
        }catch(err){
            console.error(err);
        }
    }else{
        console.error(msg);
    }
})() */