import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './core/header/header.component';
import { HomeComponent } from './core/home/home.component';
import { EbayComponent } from './ebay/ebay.component';
import { AppRoutingModule } from './app-routing.module';
import { TokensComponent } from './auth/user/ebay-settings/tokens/tokens.component';
import { TestCallComponent } from './ebay/test-call/test-call.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ServerService } from './shared/server.service';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth-guard.service';
import { UserComponent } from './auth/user/user.component';
import { ProfileComponent } from './auth/user/profile/profile.component';
import { EbayService } from './ebay/ebay.service';
import { AcceptComponent } from './auth/user/ebay-settings/accept/accept.component';
import { EbaySettingsComponent } from './auth/user/ebay-settings/ebay-settings.component';
import { EbayProductsComponent } from './ebay/ebay-products/ebay-products.component';
import { EbayActiveComponent } from './ebay/ebay-products/ebay-active/ebay-active.component';
import { EbayInventoryComponent } from './ebay/ebay-products/ebay-inventory/ebay-inventory.component';
import { EbayCreateProductsComponent } from './ebay/ebay-products/ebay-create-products/ebay-create-products.component';
import { DescriptionModalComponent } from './shared/modal/description-modal/description-modal.component';
import { DashboardComponent } from './toolbox/dashboard/dashboard.component';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { InventoryComponent } from './toolbox/inventory/inventory.component';
import { ToolboxComponent } from './toolbox/toolbox.component';
import { CreateProductsComponent } from './toolbox/inventory/create-products/create-products.component';
import { ToDoComponent } from './toolbox/to-do/to-do.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    EbayComponent,
    TokensComponent,
    TestCallComponent,
    LoginComponent,
    RegisterComponent,
    UserComponent,
    ProfileComponent,
    AcceptComponent,
    EbaySettingsComponent,
    EbayProductsComponent,
    EbayActiveComponent,
    EbayInventoryComponent,
    EbayCreateProductsComponent,
    DescriptionModalComponent,
    DashboardComponent,
    SidebarComponent,
    InventoryComponent,
    ToolboxComponent,
    CreateProductsComponent,
    ToDoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [ServerService, AuthService, AuthGuard, EbayService],
  bootstrap: [AppComponent]
})
export class AppModule { }
