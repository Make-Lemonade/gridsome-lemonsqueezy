const https = require('https');
const axios = require('axios');

class LemonSqueezy {
    static defaultOptions () {
        return {
            apiKey: '',
            storeId: '',
            apiUrl: 'https://api.lemonsqueezy.com/v1/',
            insecure: false,
        }
    }

    constructor (api, options) {
        this.options = options;

        if (!options.apiKey) {
            throw new Error(`Missing apiKey option.`);
        }
        if (!options.storeId) {
            throw new Error(`Missing storeId option.`);
        }

        let axiosConfig = {
            baseURL: options.apiUrl,
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${options.apiKey}`,
            }
        };

        if (options.insecure) {
            axiosConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
        }

        this.client = axios.create(axiosConfig);

        api.loadSource(async actions => {
            this.store = actions;

            console.log(`Loading data from ${options.apiUrl}`);

            await this.getStore(actions);
            await this.getPages(actions);
            await this.getProducts(actions);
        });

        api.createManagedPages(async actions => {
            await this.createPages(actions);
        })
    }

    async getStore(actions) {
        const res = await this.fetch(`stores/${this.options.storeId}`);
        actions.addMetadata('store', {
            ...res.data.attributes,
            id: res.data.id,
        });
    }

    async getProducts(actions) {
        const res = await this.fetchPaged(`stores/${this.options.storeId}/products`);
        const products = actions.addCollection('Products');

        res.forEach(product => {
            products.addNode({
                ...product.attributes,
                id: product.id,
            });
        });
    }

    async getPages(actions) {
        const res = await this.fetchPaged(`stores/${this.options.storeId}/pages`);
        const pages = actions.addCollection('Pages');

        res.forEach(page => {
            pages.addNode({
                ...page.attributes,
                id: page.id,
            });
        });
    }

    async createPages(actions) {
        const res = await this.fetchPaged(`stores/${this.options.storeId}/pages`);

        res.forEach(page => {
            const slug = page.attributes.is_homepage ? '' : page.attributes.slug;
            actions.createPage({
                path: `/${slug}`,
                component: `./src/templates/Page.vue`,
                context: {
                    ...page.attributes,
                    id: page.id,
                }
            });
        });
    }

    async fetch(url, config = {}) {
        let res;

        try {
            res = await this.client.request({
                url: url,
                ...config
            });
        } catch ({ response, code, config }) {
            if (!response && code) {
                throw new Error(`${code} - ${config.url}`);
            }

            throw new Error(`${response.status} - ${config.url}`);
        }

        return res.data;
    }

    async fetchPaged(url) {
        let res;
        let results = [];

        try {
            res = await this.fetch(url, {
                params: { 'page[number]': 1, 'page[size]': 100 }
            });
            results.push(...res.data);
        } catch (err) {
            console.error(err.message);
            return;
        }

        const totalPages = parseInt(res.meta.page.lastPage, 10);
        if (totalPages <= 1) {
            return results;
        }

        for (let page = 2; page <= totalPages; page++) {
            try {
                res = await this.fetch(url, {
                    params: { 'page[number]': page, 'page[size]': 100 }
                });
                results.push(...res.data);
            } catch (err) {
                console.error(err.message);
            }
        }

        return results;
    }
}

module.exports = LemonSqueezy
