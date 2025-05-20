import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from 'src/environment/environment';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'Modernize Angular Admin Tempplate';

  constructor(private userService:UserService){}

  async ngOnInit() {
    if(!environment.debug){
      window.console.log = () => {};
      window.console.warn = () => {};
    }
  }


}
