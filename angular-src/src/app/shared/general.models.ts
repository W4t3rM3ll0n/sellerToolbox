export class InventoryGroupRow {
    id: number;
    _id: number;
    sku: string;
    title: string;
    quantity: {
        availableQuantity: number,
        alertQuantity: number,
        pendingOrders: number,
        neededQuantity: number
    };
    description: string;
    upc: string | number;
    barcode: string | number;
    images: string;
    condition: string;
    location: {
        address: {
            address1: string;
            address2: string;
            city: string;
            state: string;
            zip: number
        }
    };
    binLocation: string;
    linked: boolean
}

export class ProductGroupRow {
    value: InventoryGroupRow
}
