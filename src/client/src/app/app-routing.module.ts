import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectionScreenComponent } from './selection-screen/selection-screen.component';
import { CrosswordComponent } from './crossword/crossword.component';
import { RacingComponent } from './racing/racing.component';

import { AdminScreenComponent } from './admin-screen/admin-screen.component';
import { MapEditorComponent } from './admin-screen/map-editor/map-editor.component';
import { AdminAuthGard } from './admin-screen/admin-auth.gard';

const routes: Routes = [
    { path: 'admin/map-editor', component: MapEditorComponent, canActivate: [AdminAuthGard] },
    {
        path: 'admin',
        component: AdminScreenComponent,
        canActivate: [AdminAuthGard]
    },
    { path: '', component: SelectionScreenComponent },
    { path: 'crossword', component: CrosswordComponent },
    { path: 'racing', component: RacingComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [AdminAuthGard]
})
export class AppRoutingModule { }
