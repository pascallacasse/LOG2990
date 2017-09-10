import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RenderService } from './cube/render.service';
import { BasicService } from './basic.service';
import { Routes, RouterModule } from '@angular/router';

import { AppHeaderComponent } from './app-header/app-header.component';

import { AppComponent } from './app.component';
import { CubeComponent } from './cube/cube.component';

import { CrosswordModule } from './crossword/crossword.module';
import { RacingModule } from './racing/racing.module';

import { SelectionScreenComponent } from './selection-screen/selection-screen.component';
import { CrosswordComponent } from './crossword/components/crossword/crossword.component';
import { RacingComponent } from './racing/components/racing/racing.component';
import { AdminScreenComponent } from './admin-screen/admin-screen.component';
import { MapEditorComponent } from './admin-screen/map-editor/map-editor.component';

const appRoutes: Routes = [
    { path: 'admin/map-editor' , component: MapEditorComponent},
    { path: 'admin', component: AdminScreenComponent},
    { path: '', component: SelectionScreenComponent },
    { path: 'crossword', component: CrosswordComponent },
    { path: 'racing', component: RacingComponent },
];

@NgModule({
    declarations: [
        AppComponent,
        CubeComponent,
        SelectionScreenComponent,
        AppHeaderComponent,
        AdminScreenComponent,
        MapEditorComponent
    ],
    imports: [
        BrowserModule,
        HttpModule,
        CrosswordModule,
        RacingModule,
        RouterModule.forRoot(appRoutes)
    ],
    providers: [
        RenderService,
        BasicService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
