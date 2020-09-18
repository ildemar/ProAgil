import { Component, OnInit } from '@angular/core';
import { EventoService } from 'src/app/_services/evento.service';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { BsLocaleService} from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { Evento } from 'src/app/_models/Evento';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-evento-edit',
  templateUrl: './eventoEdit.component.html',
  styleUrls: ['./eventoEdit.component.css']
})
export class EventoEditComponent implements OnInit {
  titulo = 'Editar Evento';
  evento: Evento = new Evento();
  imagemURL = 'assets/img/upload.jpg';
  registerForm: FormGroup;
  file: File;
  fileNameToUpdate: string;
  dataAtual = {};
  dataEvento: Date;

  get lotes(): FormArray{
    return this.registerForm.get('lotes') as FormArray;
}

  get redesSociais(): FormArray{
  return this.registerForm.get('redesSociais') as FormArray;
}
  adicionarLotes(){
    this.lotes.push(this.criaLote({ id : 0}));
  }

  adicionarRedeSocial(){
    this.redesSociais.push(this.criaRedeSocial({ id : 0}));
  }

  removerLote(id: number){
    this.lotes.removeAt(id);

  }
  removerRedeSocial(id: number){
    this.redesSociais.removeAt(id);
  }

  constructor(
    private eventoService: EventoService,
    private fb: FormBuilder,
    private localeService: BsLocaleService,
    // tslint:disable-next-line: align
    private toastr: ToastrService,
    private router: ActivatedRoute
    ) {
      this.localeService.use('pt-br');
    }
    criaLote(lote: any): FormGroup{
      return  this.fb.group({
        id: [lote.id],
        nome: ['lote.nome', Validators.required],
        quantidade: ['lote.quantidade', Validators.required],
        preco: ['lote.preco', Validators.required],
        dataInicio : ['lote.dataInicio '],
        dataFim: ['lote.dataFim']
      });
    }
    criaRedeSocial(redeSocial: any): FormGroup{
      return this.fb.group({
        id: [redeSocial.id],
        nome: [redeSocial.nome, Validators.required],
        url: [redeSocial.url, Validators.required]
      });
    }

    ngOnInit() {
      this.validation();
      this.carregarEvento();
    }

    carregarEvento(){
      const idEvento = +this.router.snapshot.paramMap.get('id');
      this.eventoService.getEventoByID(idEvento).subscribe(
        (evento: Evento) => {
          this.evento = Object.assign({}, evento);
          this.fileNameToUpdate = evento.imagemURL.toString();

          this.imagemURL = `http://localhost:5000/resources/images/${this.evento.imagemURL}?_ts=${this.dataAtual}`;

          this.evento.imagemURL = '';
          this.registerForm.patchValue(this.evento);

          this.evento.lotes.forEach(
            lote => {
              this.lotes.push(this.criaLote(lote));
            }
          );
          this.evento.redesSociais.forEach(
            redeSocial => {
              this.redesSociais.push(this.criaRedeSocial(redeSocial));
            }
          );
        }
      );

    }
    validation(){
      this.registerForm = this.fb.group({
        id: [],
        tema: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
        local: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(30)]],
        dataEvento: ['', Validators.required],
        imagemURL: [''],
        qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
        telefone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        lotes: this.fb.array([]),
        redesSociais:  this.fb.array([])
      });
    }

    onFileChange(file: FileList) {
      const reader = new FileReader();
      reader.onload = (event: any) => this.imagemURL = event.target.result;

      // tslint:disable-next-line: deprecation
      // this.file = event.target.files;
      reader.readAsDataURL(file[0]);
    }

    salvarEvento(){

      this.evento = Object.assign({id: this.evento.id}, this.registerForm.value);
      this.evento.imagemURL = this.fileNameToUpdate;
      this.uploadImagem();
      this.eventoService.putEvento(this.evento).subscribe(
        () => {
          this.toastr.success('Editado com sucesso');
        }, error => {
          this.toastr.error(`Error ao editar: ${error}`);
        }
        );
    }

    uploadImagem(){
      if (this.registerForm.get('imagemURL').value !== ''){
        this.eventoService.postUpload(this.file, this.fileNameToUpdate).subscribe(
          () => {
            this.dataAtual = new Date().getMilliseconds().toString();
            this.imagemURL = `http://localhost:5000/resources/images/${this.evento.imagemURL}?_ts=${this.dataAtual}`;
          }
        );
      }
    }
}
