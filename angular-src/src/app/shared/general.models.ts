export class InventoryGroupRow {
    id: number;
    _id: number;
    sku: string;
    title: string;
    quantity: {
        quantity: number,
        availableQuantity: number,
        alertQuantity: number,
        pendingOrders: number,
        neededQuantity: number
    };
    description: string;
    price: {
        purchasePrice: number,
        stockValue: number
    };
    category: string;
    variationGroup: string;
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
    detail: {
        weight: number;
        height: number;
        width: number;
        depth: number;
    };
    binLocation: string;
    monitor: Boolean;
    linked: boolean;
    createdDate: Date;
    modifiedDate: Date;
}

export class ProductGroupRow {
    value: InventoryGroupRow
}

// Address Model
export class AddressModel {

}