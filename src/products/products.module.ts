import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
// puedo usarse un archivo de barril que exporte las dos entidades y llamarlo aqui 
//ya solo se desestructura el archivo 
import { Product, ProductImg } from './entities';

// esto equibale lo mismo a lo de arriba si no tenemos el index.ts (archivo de barril)
// import { Product } from './entities/product.entity';
// import { ProductImg } from './entities/product-img.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Tambien puedo exportar TypeOrmModule si quiero trabajar co los repository , es algo comun 
  imports: [TypeOrmModule.forFeature([Product, ProductImg])], // Aqui indicamos a TyORM, que nos genere la tabla 
})
export class ProductsModule { }
