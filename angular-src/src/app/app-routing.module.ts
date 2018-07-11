import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './core/home/home.component';
import { EbayComponent } from './ebay/ebay.component';
import { TestCallComponent } from './ebay/test-call/test-call.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './auth/user/profile/profile.component';
import { AuthGuard } from './auth/auth-guard.service';
import { AcceptComponent } from './auth/user/ebay-settings/accept/accept.component';
import { UserComponent } from './auth/user/user.component';

import { EbaySettingsComponent } from './auth/user/ebay-settings/ebay-settings.component';
import { EbayProductsComponent } from './ebay/ebay-products/ebay-products.component';
import { EbayActiveComponent } from './ebay/ebay-products/ebay-active/ebay-active.component';
import { EbayInventoryComponent } from './ebay/ebay-products/ebay-inventory/ebay-inventory.component';
import { EbayCreateProductsComponent } from './ebay/ebay-products/ebay-create-products/ebay-create-products.component';

import { ToolboxComponent } from './toolbox/toolbox.component';
import { DashboardComponent } from './toolbox/dashboard/dashboard.component';
import { InventoryComponent } from './toolbox/inventory/inventory.component';
import { CreateProductsComponent } from './toolbox/inventory/create-products/create-products.component';
import { ToDoComponent } from './toolbox/to-do/to-do.component';
import { AnalyticsComponent } from './toolbox/analytics/analytics.component';
import { OrdersComponent } from './toolbox/orders/orders.component';
import { WoocommerceSettingsComponent } from './auth/user/woocommerce-settings/woocommerce-settings.component';
import { WoocommerceComponent } from './toolbox/marketplaces/woocommerce/woocommerce.component';

const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    // Routes for Dashboard
    { path: 'toolbox', component: ToolboxComponent, canActivate: [AuthGuard], children:[
        { path: 'dashboard', component: DashboardComponent },
        { path: 'inventory', component: InventoryComponent },
        { path: 'createProducts', component: CreateProductsComponent },
        { path: 'orders', component: OrdersComponent },
        { path: 'toDo', component: ToDoComponent },
        { path: 'analytics', component: AnalyticsComponent },
        { path: 'woocommerce', component: WoocommerceComponent },
    ]},
    // Routes for ebay.
    { path: 'ebay', component: EbayComponent, canActivate: [AuthGuard] },
    { path: 'ebay/accept', component: AcceptComponent, canActivate: [AuthGuard] },
    { path: 'ebay/ebayTestCall', component: TestCallComponent, canActivate: [AuthGuard] },
    { path: 'ebay/ebayProducts', component: EbayProductsComponent, canActivate: [AuthGuard], children: [
        { path: '', redirectTo: '/ebay/ebayProducts/active', pathMatch: 'full' },
        { path: 'active', component: EbayActiveComponent },
        { path: 'inventory', component: EbayInventoryComponent },
        { path: 'createProduct', component: EbayCreateProductsComponent },
    ]},
    // Auth Routes.
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    // Nested routes for users.
    { path: 'user', component: UserComponent, canActivate: [AuthGuard], children: [
        { path: '', redirectTo: '/user/profile', pathMatch: 'full' },
        { path: 'profile', component: ProfileComponent },
        { path: 'ebay', component: EbaySettingsComponent },
        { path: 'woocommerce', component: WoocommerceSettingsComponent },
    ]},
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})

export class AppRoutingModule {

}
