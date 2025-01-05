export class RecentItemsManager {
    constructor() {
        this.items = [];
        this.listeners = [];
    }

    addItem(item) {
        this.items.unshift(item);
        this.notifyListeners();
    }

    getItems() {
        return [...this.items];
    }

    clear() {
        this.items = [];
        this.notifyListeners();
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.items));
    }
}

export const recentItemsManager = new RecentItemsManager();