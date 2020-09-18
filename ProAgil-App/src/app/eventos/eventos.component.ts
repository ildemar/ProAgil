import { Component, OnInit, TemplateRef } from '@angular/core';
import { EventoService } from '../_services/evento.service';
import { Evento } from '../_models/Evento';
import { BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { defineLocale} from 'ngx-bootstrap/chronos';
import { BsLocaleService} from 'ngx-bootstrap/datepicker';
import { ptBrLocale} from 'ngx-bootstrap/chronos';
import { templateJitUrl, Identifiers } from '@angular/compiler';
import { ToastrService } from 'ngx-toastr';
defineLocale('pt-br', ptBrLocale);


@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit {
  titulo = 'Eventos';
  eventosFiltrados: Evento[];
  eventos: Evento[];
  evento: Evento;
  modoSalvar = 'post';
  imagemLargura = 50;
  imagemMargem = 2;
  mostrarImagem = false;
  registerForm: FormGroup;
  bodyDeletarEvento = '';
  file: File;
  dataAtual: string;
  // tslint:disable-next-line: variable-name
  _filtroLista = '';
  fileNameToUpdate: string;
  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private localeService: BsLocaleService,
    // tslint:disable-next-line: align
    private toastr: ToastrService
    ) {
      this.localeService.use('pt-br');
    }

    get filtroLista(): string{
      return this._filtroLista;
    }
    set filtroLista(value: string){
      this._filtroLista = value;
      this.eventosFiltrados = this.filtroLista ? this.filtrarEventos(this.filtroLista) : this.eventos;
    }
    editarEvento(evento: Evento, template: any){
      this.modoSalvar = 'put';
      this.openModal(template);
      this.evento = Object.assign({}, evento);
      this.fileNameToUpdate = evento.imagemURL.toString();
      this.evento.imagemURL = '';
      this.registerForm.patchValue(this.evento);
    }
    novoEvento(template: any){
      this.modoSalvar = 'post';
      this.openModal(template);
    }

    excluirEvento(evento: Evento, template: any) {
      this.openModal(template);
      this.evento = evento;
      this.bodyDeletarEvento = `Tem certeza que deseja excluir o Evento: ${evento.tema}, Código: ${evento.id}`;
    }

    confirmeDelete(template: any) {
      this.eventoService.deleteEvento(this.evento.id).subscribe(
        () => {
            template.hide();
            this.getEventos();
            this.toastr.success('Deletado com sucesso');
          }, error => {
            this.toastr.error('Error ao tentar deletar');
            console.log(error);
          }
      );
    }

    openModal(template: any){
      this.registerForm.reset();
      template.show();
    }

    ngOnInit() {
      this.validation();
      this.getEventos();
    }

    filtrarEventos(filtrarPor: string): Evento[] {
      filtrarPor = filtrarPor.toLocaleLowerCase();
      return this.eventos.filter(
        evento => evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1
        );
      }

      alternarImagem(){
        this.mostrarImagem = !this.mostrarImagem;

      }
      validation(){
        this.registerForm = this.fb.group({
          tema: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
          local: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(30)]],
          dataEvento: ['', Validators.required],
          imagemURL: ['', Validators.required],
          qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
          telefone: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]]
        });
      }
      onFileChange(event){
        const reader = new FileReader();
        if (event.target.files && event.target.files.length){
        this.file = event.target.files;
        console.log(this.file);
        }
      }
      uploadImagem(){
        if (this.modoSalvar === 'post'){
        const nomeArquivo = this.evento.imagemURL.split('\\', 3);
        this.evento.imagemURL = nomeArquivo[2];
        this.eventoService.postUpload(this.file, nomeArquivo[2]).subscribe(
          () => {
            this.dataAtual = new Date().getMilliseconds().toString();
            this.getEventos();
          }

        );
        } else{
          this.evento.imagemURL = this.fileNameToUpdate;
          this.eventoService.postUpload(this.file, this.fileNameToUpdate).subscribe(
            () => {
              this.dataAtual = new Date().getMilliseconds().toString();
              this.getEventos();
            }

          );
        }
      }

      salvarAlteracao(template: any){
        if (this.registerForm.valid){
          if (this.modoSalvar === 'post'){
            this.evento = Object.assign({}, this.registerForm.value);
            this.uploadImagem();

            this.eventoService.postEvento(this.evento).subscribe(
              (novoEvento: Evento) => {
                template.hide();
                this.getEventos();
                this.toastr.success('Inserido com sucesso');
              }, error => {
                this.toastr.error(`Error ao inserir: ${error}`);
              }
              );
            } else {
              this.evento = Object.assign({id: this.evento.id}, this.registerForm.value);
              this.uploadImagem();
              this.eventoService.putEvento(this.evento).subscribe(
                () => {
                  template.hide();
                  this.getEventos();
                  this.toastr.success('Editado com sucesso');
                }, error => {
                  this.toastr.error(`Error ao editar: ${error}`);
                }
                );
              }
            }
          }

          getEventos()
          {
            this.dataAtual = new Date().getMilliseconds().toString();
            // tslint:disable-next-line: deprecation
            this.eventoService.getAllEvento().subscribe(
              // tslint:disable-next-line: variable-name
              (_eventos: Evento[]) => {
                this.eventos = _eventos;
                this.eventosFiltrados = this.eventos;
                console.log(this.eventos);
                // tslint:disable-next-line: no-unused-expression

              }, error => {
                this.toastr.error(`Error ao Carregar eventos: ${error}`);
              }

              );
            }
          }

