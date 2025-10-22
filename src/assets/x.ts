export default (isWinner = false, winnerFlag = 'WINNER!') => `
<svg fill="none" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
	<foreignObject width="100%" height="100%">
		<div xmlns="http://www.w3.org/1999/xhtml">
			<style>
				*{
						margin: 0;
						box-sizing: border-box;
						font-family: sans-serif
				}
				@keyframes rotate {
					0% {
						transform: translateX(-3px);
					}
					100% {
						transform: translateX(3px);
					}
				}
				@keyframes gradientBackground {
					0% {
						background-position: 0% 50%;
					}
					50% {
						background-position: 100% 50%;
					}
					100% {
						background-position: 0% 50%;
					}
				}
				.flex {
					display: flex;
					align-items:center;
					justify-content: center;
				}
				.container{
					height: 80px;
					position: relative;
				}
				h1 {
					font-size: 80px;
					color: transparent;
					background: linear-gradient(-45deg, #fc5c7d, #6a82fb, #05dfd7);
					background-size: 600% 400%;
					background-clip: text;
					-webkit-background-clip: text;
					line-height: .8;
					display: inline-block;
					text-transform: uppercase;
					animation: rotate ease-in-out 1s infinite alternate, gradientBackground 10s ease infinite;
				}
				.winner{
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%, -50%) rotate(-15deg);
					border-radius: 5px;
					color: white;
					font-size: 10px;
					font-weight: bold;
					width: 80px;
					background: #6a82fb;
					text-align: center;
				}
			</style>
				<div class="container flex">
					<h1>X</h1>
					${
            isWinner
              ? `<span class="winner flex bg">${winnerFlag}<br/>Click to reset</span>`
              : ''
          }
				</div>
		</div>
	</foreignObject>
</svg>
`;
