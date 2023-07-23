import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';


@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService
  ) { }


  async runSeed() {
    await this.InsertarData()
    return 'Data cargada '
  }
  private async InsertarData() {
    await this.productsService.deleteAllProducts()

    const data = initialData.products
    const insertPromesas = []
    data.forEach(
      product => insertPromesas.push(this.productsService.create(product))// 
    )
    await Promise.all(insertPromesas)
    return true
  }

}
