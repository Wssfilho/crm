import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FetchProdutosUseCase } from '@/domain/triagem/application/use-cases/fetch-produtos';
import { ProdutoPresenter } from '@/infra/http/presenters/produto-presenter';

@Controller('/produtos')
@UseGuards(AuthGuard('jwt'))
export class FetchProdutosController {
  constructor(private fetchProdutos: FetchProdutosUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchProdutos.execute();

    if (result.isLeft()) {
      return { produtos: [] };
    }

    return {
      produtos: result.value.produtos.map((produto) =>
        ProdutoPresenter.toHTTP(produto),
      ),
    };
  }
}
