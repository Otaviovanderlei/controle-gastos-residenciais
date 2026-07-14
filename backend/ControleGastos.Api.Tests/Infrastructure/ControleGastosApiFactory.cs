using System.Data.Common;
using ControleGastos.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ControleGastos.Api.Tests.Infrastructure;

public sealed class ControleGastosApiFactory
    : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(
        IWebHostBuilder builder
    )
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<
                IDbContextOptionsConfiguration<AppDbContext>
            >();

            services.RemoveAll<
                DbContextOptions<AppDbContext>
            >();

            services.RemoveAll<AppDbContext>();
            services.RemoveAll<DbConnection>();

            services.AddSingleton<DbConnection>(_ =>
            {
                var conexao = new SqliteConnection(
                    "Data Source=:memory:"
                );

                conexao.Open();

                return conexao;
            });

            services.AddDbContext<AppDbContext>(
                (serviceProvider, options) =>
                {
                    var conexao = serviceProvider
                        .GetRequiredService<DbConnection>();

                    options.UseSqlite(conexao);
                }
            );
        });
    }

    public async Task ResetarBancoAsync()
    {
        using var escopo = Services.CreateScope();

        var contexto = escopo.ServiceProvider
            .GetRequiredService<AppDbContext>();

        await contexto.Database.EnsureDeletedAsync();
        await contexto.Database.EnsureCreatedAsync();
    }
}