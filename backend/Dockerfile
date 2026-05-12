# syntax=docker/dockerfile:1

# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copia somente o csproj primeiro para aproveitar cache do restore
COPY AgendamentoAPI.csproj ./
RUN dotnet restore AgendamentoAPI.csproj

# Copia o restante do código e publica em modo Release
COPY . ./
RUN dotnet publish AgendamentoAPI.csproj -c Release -o /app/publish /p:UseAppHost=false

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish ./

# Fly.io entrega tráfego na porta 8080 por padrão
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "AgendamentoAPI.dll"]
