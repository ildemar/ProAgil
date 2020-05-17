import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit {

  eventos: any;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getEventos();
  }
  getEventos()
  {
    // tslint:disable-next-line: deprecation
    this.http.get('http://localhost:5000/api/values').subscribe(Response => {
      this.eventos = Response;
      // tslint:disable-next-line: no-unused-expression
      console.log;
    }, error => {
      console.log(error);
    }

    );
  }
}
