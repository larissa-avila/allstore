import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  erro = '';
  carregando = false;

  constructor(private authService: AuthService, private router: Router) { }

  entrar(): void {
    this.erro = '';

    if (!this.username || !this.password) {
      this.erro = 'Preencha todos os campos.';
      return;
    }

    this.carregando = true;

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.accessToken);
        this.authService.getMe(res.accessToken).subscribe({
          next: (user) => {
            localStorage.setItem('user', JSON.stringify(user));
            this.carregando = false;
            if (user.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/home']);
            }
          },
          error: () => {
            this.erro = 'Erro ao buscar dados do usuário.';
            this.carregando = false;
          }
        });
      },
      error: () => {
        this.erro = 'Usuário ou senha incorretos.';
        this.carregando = false;
      }
    });
  }
}